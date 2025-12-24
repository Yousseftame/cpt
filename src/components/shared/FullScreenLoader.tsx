import BrandLoader from "./BrandLoader";


export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <BrandLoader />
    </div>
  );
}
