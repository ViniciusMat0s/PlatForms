const iconPaths = {
  dashboard: (
    <>
      <path d="M4 6.5h7v5H4z" />
      <path d="M13 6.5h7v8h-7z" />
      <path d="M4 14.5h7v3H4z" />
      <path d="M13 17.5h7v-2h-7z" />
    </>
  ),
  library: <path d="M5.5 6.5h13M5.5 12h13M5.5 17.5h13M7.5 6.5v11" />,
  builder: (
    <>
      <path d="M7 5.5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
      <path d="M8.5 9h7M8.5 12h5M8.5 15h4" />
    </>
  ),
  runner: <path d="M8 7.5h8M8 12h8M8 16.5h5M4.5 7.5h.01M4.5 12h.01M4.5 16.5h.01" />,
  results: (
    <>
      <path d="M6 5.5h12v13H6z" />
      <path d="M9 9.5h6M9 12.5h6M9 15.5h4" />
    </>
  ),
  search: <path d="m16.5 16.5 4 4M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />,
  bell: <path d="M9 18a3 3 0 0 0 6 0M6.5 15.5h11l-1.2-2.1V10a4.3 4.3 0 0 0-8.6 0v3.4L6.5 15.5Z" />,
  settings: (
    <>
      <path d="M10.5 4.5h3l.5 2a6.6 6.6 0 0 1 1.4.6l1.8-1.2 2.1 2.1-1.2 1.8a6.6 6.6 0 0 1 .6 1.4l2 .5v3l-2 .5a6.6 6.6 0 0 1-.6 1.4l1.2 1.8-2.1 2.1-1.8-1.2a6.6 6.6 0 0 1-1.4.6l-.5 2h-3l-.5-2a6.6 6.6 0 0 1-1.4-.6l-1.8 1.2-2.1-2.1 1.2-1.8a6.6 6.6 0 0 1-.6-1.4l-2-.5v-3l2-.5a6.6 6.6 0 0 1 .6-1.4L4.7 8l2.1-2.1 1.8 1.2a6.6 6.6 0 0 1 1.4-.6l.5-2Z" />
      <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </>
  ),
  academy: (
    <>
      <path d="M4.5 8.5 12 4l7.5 4.5L12 13 4.5 8.5Z" />
      <path d="M7 10v3.5c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5V10" />
    </>
  ),
  logout: <path d="M10 5.5H6.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2H10M14.5 9l3 3-3 3M17.5 12h-8" />,
  chart: <path d="M6 17.5h12M7.5 15V11.5M12 15V8.5M16.5 15v-5" />,
  target: <path d="M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Z M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />,
  users: <path d="M8 14.5c-2.2 0-3.5 1.2-3.5 2.7V19h7M16 14.5c2.2 0 3.5 1.2 3.5 2.7V19h-7M8 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  spark: <path d="m12 4.5 1.9 4.6 4.6 1.9-4.6 1.9L12 17.5l-1.9-4.6-4.6-1.9 4.6-1.9L12 4.5Z" />,
};

export default function Icon({ name, className = '', size = 20, strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name] ?? iconPaths.dashboard}
    </svg>
  );
}
