// useQueryToast.ts
// useQueryToast.ts
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useToast } from "~/Hooks/use-toast";

export interface ToastConfig {
  title: string;
  description?: string;
  variant?: "success" | "error"; // デフォルトは success
}

type MessageMap = {
  [paramKey: string]: {
    [paramValue: string]: ToastConfig;
  };
};

interface Options {
  query: Record<string, string | null>;
  messages: MessageMap;
  basePath: string;
}

export function useQueryToast({ query, messages, basePath }: Options) {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let shown = false;

    // ページ固有のメッセージ判定
    for (const [key, mapping] of Object.entries(messages)) {
      const value = query[key];
      if (value && mapping[value]) {
        const cfg = mapping[value];
        toast({
          ...cfg,
          variant: cfg.variant ?? "success",
        });
        shown = true;
        break;
      }
    }

    // 共通の error ハンドリング
    if (!shown && query.status === "error") {
      toast({
        title: "エラーが発生しました",
        description: "処理に失敗しました",
        variant: "error",
      });
      shown = true;
    }

    // 表示したらクエリを消す
    if (shown) {
      navigate(basePath, { replace: true });
    }
  }, [query.status, query.type, messages, basePath, toast, navigate]);
}

// 使い方の例は app/routes/admin.panel.editStore.tsx を参照
// なお、共通の error ハンドリングは必要に応じて調整してください