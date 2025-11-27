import { IconClasses } from "../../types/iconClasses";

export const LeftArrow = (props: IconClasses) => {
  const { className } = props;
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      {" "}
      <path
        d="M20 11v2H8v2H6v-2H4v-2h2V9h2v2h12zM10 7H8v2h2V7zm0 0h2V5h-2v2zm0 10H8v-2h2v2zm0 0h2v2h-2v-2z"
        fill="currentColor"
      />{" "}
    </svg>
  );
};
