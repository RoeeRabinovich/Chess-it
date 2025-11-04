import { IconClasses } from "../../types/iconClasses";

export const Flip = (props: IconClasses) => {
  const { className } = props;
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        d="M15 21h-2v-2h2v2zm-4 0h-2v-2h2v2zm8-9h-2V7h2v5zm-4-5h-2v5h2V7zm-6 5H7V7h2v5zm-4 5H3V7h2v10zm18-2v2h-2v-2h2zm-20 0v2H3v-2h2zm16-6V7h2v4h-2zm-4-4V3h2v4h-2zm-6 0V3h2v4H7zm-4 0V3h2v4H3z"
        fill="currentColor"
      />
    </svg>
  );
};

