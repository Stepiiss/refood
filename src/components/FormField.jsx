export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  minLength,
  rows = 4,
  as = "input",
  options = [],
  className = "",
  wrapperClassName = "",
}) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
          {label}
        </label>
      )}

      {as === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`form-input ${className}`}
        />
      ) : as === "select" ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          className={`form-input ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          minLength={minLength}
          className={`form-input ${className}`}
        />
      )}
    </div>
  );
}