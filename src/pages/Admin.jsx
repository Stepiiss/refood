import { useState, useEffect, useMemo } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  getDoc,
  limit,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Logo from "../components/logo";
import Navbar from "../components/navbar";
import ProductCard from "../components/ProductCard";
import BlackButton from "../components/BlackButton";
import ErrorAlert from "../components/ErrorAlert";
import ProductCardSkeletonGrid from "../components/ProductCardSkeletonGrid";
import RoleBadge from "../components/RoleBadge";
import { cleanupExpiredProducts } from "../utils/cleanupExpiredProducts";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [reviewSearch, setReviewSearch] = useState("");
  const navigate = useNavigate();

  // Jednotné třídy pro záložky, aby nebyla logika stylů duplikovaná
  const getTabButtonClass = (tabName) => {
    return `px-3 sm:px-6 py-3 text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
      activeTab === tabName
        ? "text-[#25A73D] border-b-2 border-[#25A73D]"
        : "text-gray-500 hover:text-gray-700"
    }`;
  };

  // Kontrola admin oprávnění
  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        } else {
          alert("Nemáte oprávnění pro přístup k admin panelu");
          navigate("/");
        }
      } catch (err) {
        console.error("Chyba při ověřování:", err);
        navigate("/");
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        if (activeTab === "products") {
          // Vymaž prošlé produkty před načtením
          await cleanupExpiredProducts();

          const q = query(
            collection(db, "products"),
            orderBy("createdAt", "desc"),
            limit(100)
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(data);
        } else if (activeTab === "users") {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const usersData = usersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Načtení uživatelé:", usersData);
          setUsers(usersData);
        } else {
          const reviewsQuery = query(
            collection(db, "reviews"),
            orderBy("createdAt", "desc"),
            limit(300)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsData = reviewsSnapshot.docs.map((reviewDoc) => ({
            id: reviewDoc.id,
            ...reviewDoc.data(),
          }));
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error("Chyba při načítání:", err);
        setError(`Nepodařilo se načíst data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError("");
    fetchData();
  }, [isAdmin, activeTab]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Opravdu chcete smazat tuto nabídku?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (err) {
      console.error("Chyba při mazání produktu:", err);
      alert("Nepodařilo se smazat produkt");
    }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    if (userId === auth.currentUser?.uid) {
      alert("Nemůžete změnit svou vlastní roli");
      return;
    }

    if (
      window.confirm(
        `Opravdu chcete ${
          currentRole === "admin" ? "odebrat" : "přidat"
        } admin práva?`
      )
    ) {
      try {
        await updateDoc(doc(db, "users", userId), {
          role: currentRole === "admin" ? "user" : "admin",
        });
        setUsers(
          users.map((u) =>
            u.id === userId
              ? { ...u, role: currentRole === "admin" ? "user" : "admin" }
              : u
          )
        );
      } catch (err) {
        console.error("Chyba při změně role:", err);
        alert("Nepodařilo se změnit roli uživatele");
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Opravdu chcete smazat tuto recenzi?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    } catch (err) {
      console.error("Chyba při mazání recenze:", err);
      alert("Nepodařilo se smazat recenzi");
    }
  };

  const renderStars = (value = 0) => {
    return "★".repeat(value) + "☆".repeat(Math.max(5 - value, 0));
  };

  const filteredReviews = useMemo(() => {
    const search = reviewSearch.trim().toLowerCase();

    return reviews.filter((review) => {
      if (!search) return true;

      const text = `${review.text || ""} ${review.reviewerName || ""} ${
        review.reviewerEmail || ""
      } ${review.userId || ""}`.toLowerCase();

      return text.includes(search);
    });
  }, [reviews, reviewSearch]);

  const reviewStats = useMemo(() => {
    const total = reviews.length;

    const averageRating = total
      ? Math.round(
          (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / total) * 10
        ) / 10
      : 0;

    return { total, averageRating };
  }, [reviews]);

  if (checkingAuth) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="surface-card p-8">
          <p className="text-xl text-gray-700">Ověřování oprávnění...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="page-shell flex flex-col">
      <Navbar />

      <div className="page-content mt-25">
        <div className="surface-card">
          <div className="text-center flex flex-col gap-2 mb-8">
            <Logo className="h-16 mb-5" />
            <h2 className="text-3xl font-bold text-gray-800">Admin panel</h2>
          </div>

          {/* Záložky */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-max gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab("products")}
                className={getTabButtonClass("products")}
              >
                Produkty
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={getTabButtonClass("users")}
              >
                Uživatelé
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={getTabButtonClass("reviews")}
              >
                Recenze
              </button>
            </div>
          </div>

          <ErrorAlert message={error} centered className="mb-6" />

          {loading ? (
            <ProductCardSkeletonGrid count={8} />
          ) : activeTab === "products" ? (
            products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showActions={true}
                    onEdit={(id) => navigate(`/edit-product/${id}`)}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Žádné nabídky k zobrazení
              </div>
            )
          ) : activeTab === "users" ? (
            users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Vytvořeno
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                        Akce
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800">{user.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {user.createdAt?.toDate
                            ? user.createdAt.toDate().toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <BlackButton
                              onClick={() => handleToggleAdmin(user.id, user.role)}
                              className={`px-3 py-1 text-sm ${
                                user.role === "admin"
                                  ? "!bg-orange-500 hover:!bg-orange-600"
                                  : "!bg-blue-500 hover:!bg-blue-600"
                              }`}
                            >
                              {user.role === "admin"
                                ? "Odebrat admin"
                                : "Přidat admin"}
                            </BlackButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Žádní uživatelé k zobrazení
              </div>
            )
          ) : (
            <div className="space-y-6 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Celkem recenzí</p>
                  <p className="text-2xl font-bold text-gray-800">{reviewStats.total}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Průměrné hodnocení</p>
                  <p className="text-2xl font-bold text-gray-800">{reviewStats.averageRating} / 5</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Hledat text, email, jméno..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="form-input sm:max-w-md"
                />
              </div>

              {filteredReviews.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[920px] border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-3 text-left text-gray-700 font-semibold">Hodnocení</th>
                        <th className="px-3 py-3 text-left text-gray-700 font-semibold">Recenze</th>
                        <th className="px-3 py-3 text-left text-gray-700 font-semibold">Autor</th>
                        <th className="px-3 py-3 text-left text-gray-700 font-semibold">Datum</th>
                        <th className="px-3 py-3 text-left text-gray-700 font-semibold">Akce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map((review) => (
                        <tr key={review.id} className="border-b hover:bg-gray-50 align-top">
                          <td className="px-3 py-3 text-yellow-500 whitespace-nowrap">
                            {renderStars(review.rating || 0)}
                          </td>
                          <td className="px-3 py-3 text-gray-700 max-w-[300px]">
                            <p className="line-clamp-3">{review.text || "Bez textu"}</p>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 min-w-[180px]">
                            <p>{review.reviewerName || "Neznámý"}</p>
                            <p>{review.reviewerEmail || "Bez emailu"}</p>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {review.createdAt?.toDate
                              ? review.createdAt.toDate().toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-3 py-3 min-w-[120px]">
                            <div className="flex flex-col gap-2">
                              <BlackButton
                                onClick={() => handleDeleteReview(review.id)}
                                className="!bg-red-600 hover:!bg-red-700 px-3 py-2 text-xs"
                              >
                                Smazat
                              </BlackButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Žádné recenze podle aktuálních filtrů
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
