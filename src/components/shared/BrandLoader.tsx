
export default function AppLoader({
}: {
  text?: string;
}) {
  return (
<div
  className="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 md:w-28 md:h-28 h-32 w-32 aspect-square rounded-full"
>
  <div
    className="rounded-full h-full w-full bg-slate-100 background-blur-md"
  ></div>
</div>



  );
}
