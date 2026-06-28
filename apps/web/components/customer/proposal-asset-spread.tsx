import Image from 'next/image';
export function ProposalAssetSpread({
  kind,
  name,
  description,
  imageUrl,
  keywords,
  notes,
}: {
  kind: string;
  name: string;
  description?: string | null;
  imageUrl: string;
  keywords?: string[];
  notes?: string | null;
}) {
  return (
    <article className="group flex flex-col overflow-hidden bg-portal-surface transition-all">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          unoptimized
        />
        <div className="absolute top-4 left-4 border border-portal-border bg-portal-surface px-3 py-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {kind}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="font-serif text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {keywords?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className=" bg-secondary/50 px-2 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {kw}
              </span>
            ))}
          </div>
        ) : null}
        {notes && (
          <div className="mt-auto pt-6">
            <div className=" bg-portal-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Designer Notes
              </p>
              <p className="text-sm italic leading-relaxed text-foreground">
                {notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
