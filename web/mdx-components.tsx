import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 text-3xl font-black tracking-tight text-white first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2
        id={id}
        className="mt-10 mb-3 scroll-mt-24 text-2xl font-bold tracking-tight text-white"
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id}
        className="mt-8 mb-2 scroll-mt-24 text-xl font-bold text-white"
      >
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4
        id={id}
        className="mt-6 mb-2 scroll-mt-24 text-lg font-semibold text-zinc-100"
      >
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="my-4 leading-8 text-zinc-300">{children}</p>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-miransas-cyan underline underline-offset-4 transition hover:text-white"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="my-4 ml-6 space-y-1.5 list-disc marker:text-miransas-cyan/60 text-zinc-300">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 space-y-1.5 list-decimal marker:text-miransas-cyan/60 text-zinc-300">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-miransas-cyan/40 pl-5 text-zinc-400 italic">
        {children}
      </blockquote>
    ),
    code: ({ children, className }) => {
      // inline code (no language class)
      if (!className) {
        return (
          <code className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-sm text-miransas-cyan">
            {children}
          </code>
        );
      }
      return (
        <code className={`${className} block`}>{children}</code>
      );
    },
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0a0b10] p-5 font-mono text-sm leading-7 text-zinc-200">
        {children}
      </pre>
    ),
    hr: () => <hr className="my-10 border-white/[0.08]" />,
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="text-zinc-300">{children}</em>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="min-w-full divide-y divide-white/[0.08] text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/[0.03]">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-zinc-300">{children}</td>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-white/[0.05] last:border-0">{children}</tr>
    ),
    ...components,
  };
}
