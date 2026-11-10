import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icono para "Añadir a pantalla de inicio" en iPhone/iPad. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1fa37a 0%, #0f6e60 100%)",
        }}
      >
        <svg width="120" height="120" viewBox="6 5 20 22">
          <path
            d="M10.5 23.5V8.5h6a4.25 4.25 0 0 1 0 8.5h-6M15.5 17l6 6.5M21.5 18.75v4.75h-4.75"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
