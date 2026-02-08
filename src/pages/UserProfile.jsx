import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import Navbar from "../components/navbar";
import Logo from "../components/logo";

const MAX_REVIEW_LENGTH = 500;

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);

      try {
        const currentDoc = await getDoc(doc(db, "users", user.uid));
        if (currentDoc.exists()) {
          setCurrentUserProfile({ id: user.uid, ...currentDoc.data() });
        } else {
          setCurrentUserProfile({ id: user.uid, email: user.email });
        }
      } catch (err) {
        console.error("Chyba při načítání profilu uživatele:", err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!userId) {
        setError("Uživatel nenalezen");
        setLoadingProfile(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, "users", userId));
        if (profileDoc.exists()) {
          setProfileUser({ id: userId, ...profileDoc.data() });
        } else {
          setProfileUser({ id: userId, name: "Neznámý uživatel" });
        }
      } catch (err) {
        console.error("Chyba při načítání profilu:", err);
        setError("Nepodařilo se načíst profil uživatele");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileUser();
  }, [userId]);

  const fetchReviews = async () => {
    if (!userId) {
      setLoadingReviews(false);
      return;
    }

    try {
      const q = query(collection(db, "reviews"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docRef) => ({
        id: docRef.id,
        ...docRef.data(),
      }));

      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });

      setReviews(data);
    } catch (err) {
      console.error("Chyba při načítání recenzí:", err);
      setError("Nepodařilo se načíst recenze");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (!currentUser) {
      setReviewError("Pro přidání recenze se musíte přihlásit");
      return;
    }

    if (currentUser.uid === userId) {
      setReviewError("Nemůžete hodnotit vlastní profil");
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError("Zvolte počet hvězdiček");
      return;
    }

    if (!reviewText.trim()) {
      setReviewError("Napište prosím recenzi");
      return;
    }

    if (reviewText.trim().length > MAX_REVIEW_LENGTH) {
      setReviewError(`Recenze může mít maximálně ${MAX_REVIEW_LENGTH} znaků`);
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "reviews"), {
        userId,
        reviewerId: currentUser.uid,
        reviewerEmail: currentUser.email || "",
        reviewerName: currentUserProfile?.name || "",
        rating,
        text: reviewText.trim(),
        createdAt: serverTimestamp(),
      });

      setReviewText("");
      setRating(0);
      await fetchReviews();
    } catch (err) {
      console.error("Chyba při ukládání recenze:", err);
      setReviewError("Nepodařilo se uložit recenzi");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < value;
      return (
        <span
          key={index}
          className={filled ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      );
    });
  };

  if (loadingProfile) {
    return (
      <div className="bg-[#25A73D] min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xl text-white">Načítám profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#25A73D] min-h-screen w-screen overflow-x-hidden">
      <Navbar />

      <div className="w-full mt-25 px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <Logo className="h-16 mb-5 mx-auto" />
            <Link to="/offers" className="text-[#25A73D] hover:underline mb-4 inline-block">
              ← Zpět na nabídky
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Profil uživatele</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-5 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Základní informace</h2>
              <p className="text-gray-700 font-medium text-lg">
                {profileUser?.name || "Uživatel"}
              </p>
              {profileUser?.email && (
                <p className="text-gray-500 text-sm mt-1 break-words">{profileUser.email}</p>
              )}
            </div>
            <div className="bg-gray-50 p-5 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Hodnocení</h2>
              <div className="flex items-center gap-3">
                <div className="text-xl">{renderStars(Math.round(averageRating))}</div>
                <span className="text-gray-700 font-semibold">{averageRating || "0"} / 5</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">Počet recenzí: {reviews.length}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Napsat recenzi</h2>

            {currentUser && currentUser.uid === userId ? (
              <p className="text-gray-600">Nemůžete hodnotit vlastní profil.</p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Počet hvězdiček</p>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }, (_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`text-2xl transition-colors ${
                            value <= rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                          aria-label={`Hvězdičky: ${value}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recenze</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full min-h-[120px] p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-[#25A73D] focus:outline-none"
                    placeholder="Napište svou zkušenost..."
                    maxLength={MAX_REVIEW_LENGTH}
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">
                    {reviewText.length}/{MAX_REVIEW_LENGTH}
                  </p>
                </div>

                {reviewError && (
                  <p className="text-sm text-red-600 font-medium">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#25A73D] text-white px-6 py-3 rounded-lg hover:bg-[#1e8c32] transition-colors disabled:opacity-60"
                >
                  {submitting ? "Ukládám..." : "Odeslat recenzi"}
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recenze uživatele</h2>

            {loadingReviews ? (
              <p className="text-gray-500">Načítám recenze...</p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-lg">{renderStars(review.rating || 0)}</div>
                      <span className="text-xs text-gray-500">
                        {review.createdAt?.toDate
                          ? review.createdAt.toDate().toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">{review.text}</p>
                    <p className="text-sm text-gray-500 mt-3">
                      {review.reviewerName || review.reviewerEmail || "Anonym"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Zatím bez recenzí.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
