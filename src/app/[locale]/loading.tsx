import BeatLoader from "react-spinners/BeatLoader";

export default function loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BeatLoader />
    </div>
  );
}
