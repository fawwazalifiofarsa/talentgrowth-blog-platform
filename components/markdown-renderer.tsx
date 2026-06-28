import type { ReactNode } from "react";

type MarkdownRendererProps = {
  content: string;
};

type Block =
  | { type: "code"; content: string }
  | { type: "heading"; level: number; content: string }
  | { type: "paragraph"; content: string }
  | { type: "quote"; content: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "rule" };

function isSafeLink(href: string) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return true;
  }

  try {
    const url = new URL(href);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getFirstMatch(text: string, patterns: RegExp[]) {
  return patterns
    .map((pattern) => {
      pattern.lastIndex = 0;
      return pattern.exec(text);
    })
    .filter((match): match is RegExpExecArray => Boolean(match))
    .sort((first, second) => first.index - second.index)[0];
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let index = 0;
  const patterns = [
    /`([^`]+)`/,
    /\[([^\]]+)]\(([^)\s]+)\)/,
    /(\*\*|__)(.+?)\1/,
    /(\*|_)([^*_]+?)\1/,
  ];

  while (remaining) {
    const match = getFirstMatch(remaining, patterns);

    if (!match) {
      nodes.push(remaining);
      break;
    }

    if (match.index > 0) {
      nodes.push(remaining.slice(0, match.index));
    }

    const key = `${keyPrefix}-${index}`;
    const matchedText = match[0];

    if (matchedText.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-950"
        >
          {match[1]}
        </code>,
      );
    } else if (matchedText.startsWith("[")) {
      const href = match[2];

      if (isSafeLink(href)) {
        const isExternal = href.startsWith("http");

        nodes.push(
          <a
            key={key}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="font-medium text-slate-950 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-950"
          >
            {renderInline(match[1], `${key}-link`)}
          </a>,
        );
      } else {
        nodes.push(match[1]);
      }
    } else if (matchedText.startsWith("**") || matchedText.startsWith("__")) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-950">
          {renderInline(match[2], `${key}-strong`)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {renderInline(match[2], `${key}-em`)}
        </em>,
      );
    }

    remaining = remaining.slice(match.index + matchedText.length);
    index += 1;
  }

  return nodes;
}

function isListItem(line: string, ordered: boolean) {
  return ordered ? /^\d+\.\s+/.test(line) : /^[-*+]\s+/.test(line);
}

function stripListMarker(line: string, ordered: boolean) {
  return line.replace(ordered ? /^\d+\.\s+/ : /^[-*+]\s+/, "");
}

function isTableRow(line: string) {
  return line.includes("|") && line.split("|").length > 2;
}

function isTableSeparator(line: string) {
  if (!isTableRow(line)) {
    return false;
  }

  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdown(content: string) {
  const blocks: Block[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push({ type: "code", content: codeLines.join("\n") });
      index += index < lines.length ? 1 : 0;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmedLine);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (/^([-*_])\1\1+$/.test(trimmedLine)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (
      isTableRow(trimmedLine) &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      const headers = splitTableRow(trimmedLine);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && isTableRow(lines[index].trim())) {
        if (!isTableSeparator(lines[index].trim())) {
          const cells = splitTableRow(lines[index].trim());
          rows.push(headers.map((_, cellIndex) => cells[cellIndex] ?? ""));
        }

        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (trimmedLine.startsWith(">")) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "quote", content: quoteLines.join(" ") });
      continue;
    }

    const isOrderedList = isListItem(trimmedLine, true);
    const isUnorderedList = isListItem(trimmedLine, false);

    if (isOrderedList || isUnorderedList) {
      const ordered = isOrderedList;
      const items: string[] = [];

      while (
        index < lines.length &&
        isListItem(lines[index].trim(), ordered)
      ) {
        items.push(stripListMarker(lines[index].trim(), ordered));
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const currentLine = lines[index].trim();

      if (
        !currentLine ||
        currentLine.startsWith("```") ||
        currentLine.startsWith(">") ||
        /^(#{1,6})\s+/.test(currentLine) ||
        /^([-*_])\1\1+$/.test(currentLine) ||
        (isTableRow(currentLine) &&
          index + 1 < lines.length &&
          isTableSeparator(lines[index + 1].trim())) ||
        isListItem(currentLine, true) ||
        isListItem(currentLine, false)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push({ type: "paragraph", content: paragraphLines.join(" ") });
  }

  return blocks;
}

function getHeadingClass(level: number) {
  if (level === 1) {
    return "mt-8 text-3xl font-semibold leading-tight text-slate-950 first:mt-0";
  }

  if (level === 2) {
    return "mt-8 text-2xl font-semibold leading-tight text-slate-950 first:mt-0";
  }

  if (level === 3) {
    return "mt-7 text-xl font-semibold leading-snug text-slate-950 first:mt-0";
  }

  return "mt-6 text-lg font-semibold leading-snug text-slate-950 first:mt-0";
}

function renderHeading(block: Extract<Block, { type: "heading" }>, index: number) {
  const className = getHeadingClass(block.level);
  const content = renderInline(block.content, `heading-${index}`);

  if (block.level === 1) {
    return (
      <h1 key={index} className={className}>
        {content}
      </h1>
    );
  }

  if (block.level === 2) {
    return (
      <h2 key={index} className={className}>
        {content}
      </h2>
    );
  }

  if (block.level === 3) {
    return (
      <h3 key={index} className={className}>
        {content}
      </h3>
    );
  }

  if (block.level === 4) {
    return (
      <h4 key={index} className={className}>
        {content}
      </h4>
    );
  }

  if (block.level === 5) {
    return (
      <h5 key={index} className={className}>
        {content}
      </h5>
    );
  }

  return (
    <h6 key={index} className={className}>
      {content}
    </h6>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const blocks = parseMarkdown(content);

  return (
    <div className="min-w-0 space-y-5 break-words text-base leading-8 text-slate-800">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return renderHeading(block, index);
        }

        if (block.type === "paragraph") {
          return (
            <p key={index}>
              {renderInline(block.content, `paragraph-${index}`)}
            </p>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-slate-300 pl-4 italic text-slate-700"
            >
              {renderInline(block.content, `quote-${index}`)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-md border border-slate-200 bg-slate-100 p-4 text-sm leading-6 text-slate-950"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";

          return (
            <List
              key={index}
              className={`space-y-2 pl-6 ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {renderInline(item, `list-${index}-${itemIndex}`)}
                </li>
              ))}
            </List>
          );
        }

        if (block.type === "table") {
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-md border border-slate-200"
            >
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-950">
                  <tr>
                    {block.headers.map((header, headerIndex) => (
                      <th
                        key={headerIndex}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {renderInline(header, `table-${index}-head-${headerIndex}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {block.headers.map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 align-top text-slate-700"
                        >
                          {renderInline(
                            row[cellIndex] ?? "",
                            `table-${index}-row-${rowIndex}-${cellIndex}`,
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <hr key={index} className="border-slate-200" />;
      })}
    </div>
  );
}
