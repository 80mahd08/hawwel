import BeatLoader from "react-spinners/BeatLoader";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <BeatLoader />
    </div>
  );
}
