import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownViewProps {
  content: string;
  className?: string;
  focusable?: boolean;
}

/**
 * Renders sanitized markdown content with GitHub-flavored markdown support.
 * Includes lists, task lists, tables, bold, italic, code blocks, etc.
 */
export function MarkdownView({ content, className = '', focusable = false }: MarkdownViewProps) {
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      {...(focusable && { tabIndex: 0 })}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
