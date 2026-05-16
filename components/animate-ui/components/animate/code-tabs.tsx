'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  type TabsProps,
} from '@/components/animate-ui/primitives/animate/tabs';
import { CopyButton } from '@/components/animate-ui/components/buttons/copy';

type CodeTabsProps = {
  codes: Record<string, string>;
  lang?: string;
  themes?: { light: string; dark: string };
  isStreaming?: boolean;
  copyButton?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
} & Omit<TabsProps, 'children'>;

function CodeTabs({
  codes,
  lang = 'bash',
  themes = {
    light: 'github-light',
    dark: 'github-dark',
  },
  className,
  defaultValue,
  value,
  onValueChange,
  copyButton = true,
  onCopiedChange,
  isStreaming = false,
  ...props
}: CodeTabsProps) {
  const { resolvedTheme } = useTheme();

  const [highlightedCodes, setHighlightedCodes] = React.useState<Record<
    string,
    string
  > | null>(null);
  const [selectedCode, setSelectedCode] = React.useState<string>(
    value ?? defaultValue ?? Object.keys(codes)[0] ?? '',
  );

  React.useEffect(() => {
    if (isStreaming) {
      setHighlightedCodes(null);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      try {
        const { codeToHtml } = await import('shiki');
        const newHighlightedCodes: Record<string, string> = {};

        // Sanitize language for Shiki
        const shikiLang = (lang === 'chart' || lang === 'chart-json') ? 'json' : (lang || 'txt');

        for (const [command, val] of Object.entries(codes)) {
          try {
            const highlighted = await codeToHtml(val, {
              lang: shikiLang,
              themes: {
                light: themes.light,
                dark: themes.dark,
              },
              defaultColor: resolvedTheme === 'dark' ? 'dark' : 'light',
            });
            newHighlightedCodes[command] = highlighted;
          } catch (langError) {
            // Internal fallback for specific language failures
            console.warn(`Shiki: falling back to txt for ${shikiLang}`, langError);
            const fallback = await codeToHtml(val, {
              lang: 'txt',
              themes: {
                light: themes.light,
                dark: themes.dark,
              },
              defaultColor: resolvedTheme === 'dark' ? 'dark' : 'light',
            });
            newHighlightedCodes[command] = fallback;
          }
        }

        if (isMounted) {
          setHighlightedCodes(newHighlightedCodes);
        }
      } catch (error) {
        // Only log if it's a real fatal error, not just a missing language
        if (isMounted) {
          console.warn('Shiki highlighting failed, falling back to raw code.', error);
          setHighlightedCodes(null);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [resolvedTheme, lang, themes.light, themes.dark, codes, isStreaming]);

  const displayCodes = highlightedCodes || codes;

  return (
    <Tabs
      data-slot="install-tabs"
      className={cn(
        'w-full gap-0 bg-muted/50 rounded-xl border overflow-hidden',
        className,
      )}
      {...props}
      value={selectedCode}
      onValueChange={(val) => {
        setSelectedCode(val);
        onValueChange?.(val);
      }}
    >
      <TabsHighlight className="absolute z-0 inset-0 rounded-none shadow-none bg-transparent after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0 dark:after:bg-white after:bg-black after:rounded-t-full">
        <TabsList
          data-slot="install-tabs-list"
          className="w-full relative flex items-center justify-between rounded-none h-10 bg-muted border-b border-border/75 dark:border-border/50 text-current py-0 px-4"
        >
          <div className="flex gap-x-3 h-full">
            {Object.keys(codes).map((code) => (
              <TabsHighlightItem
                key={code}
                value={code}
                className="flex items-center justify-center"
              >
                <TabsTrigger
                  key={code}
                  value={code}
                  className="text-muted-foreground h-full text-sm font-medium data-[state=active]:text-current px-4"
                >
                  {code}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </div>

          {copyButton && (
            <CopyButton
              content={codes[selectedCode]}
              size="xs"
              variant="ghost"
              className="-me-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
              onCopiedChange={onCopiedChange}
            />
          )}
        </TabsList>
      </TabsHighlight>

      <TabsContents data-slot="install-tabs-contents" className="bg-zinc-950/50 dark:bg-zinc-900/50 border-t border-border/50">
        {Object.entries(codes).map(([code, val]) => (
          <TabsContent
            data-slot="install-tabs-content"
            key={code}
            className="w-full m-0"
            value={code}
          >
            <div
              className="w-full min-h-[120px] text-[14px] overflow-auto p-6 [&>pre]:!bg-transparent [&>pre]:!p-0 [&_code]:!bg-transparent [&>pre,_&_code]:border-none font-mono leading-relaxed selection:bg-primary/30"
              dangerouslySetInnerHTML={{ __html: highlightedCodes?.[code] ? highlightedCodes[code] : `<pre><code>${val}</code></pre>` }}
            />
          </TabsContent>
        ))}
      </TabsContents>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
