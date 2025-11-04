import { IconClasses } from "../../types/iconClasses";

export const RightArrow = (props: IconClasses) => {
  const { className } = props;
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
        fill="currentColor"
      />
    </svg>
  );
};

