export default function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="font-editorial text-4xl text-primary">{title}</h1>
      <div className="mt-12 bg-white rounded-2xl border border-stone-200 p-16 text-center">
        <span className="material-symbols-outlined text-6xl text-stone-300">
          {icon}
        </span>
        <p className="mt-4 font-editorial text-xl text-stone-700">
          Próximamente
        </p>
        <p className="mt-2 text-sm text-stone-500 max-w-md mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
