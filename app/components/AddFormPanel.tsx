import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type SetStateAction } from "react";
import { Form, useLocation, useNavigation, type LoaderFunctionArgs } from "react-router";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/Dialog";
import { useToast } from "~/Hooks/use-toast";

type AddFormPanelProps = {
  title: string;
  onAddForm: () => void;
  dialogTitle: string;
  dialogContent: ReactNode;
  loaderData: {success: boolean | undefined};
  children: ReactNode;
};

export const commonAddFormLoader = async ({ request }:LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const successParam = url.searchParams.get("success");

  const success =
    successParam === "1" ? true : successParam === "0" ? false : undefined;

  return { success };
}

export const AddFormPanel = ({
  title,
  onAddForm,
  dialogTitle,
  dialogContent,
  loaderData,
  children,
}: AddFormPanelProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const { state } = navigation;
  const onConfirm = () => {
    formRef.current?.requestSubmit();
    // setIsDialogOpen(false);
  }
  const location = useLocation();
  const { success } = loaderData;
  const { toast } = useToast();

  useEffect(() => {
    console.log(location.key)
    if (success !== undefined) {
      if (success) {
        toast({ title: "追加", description: "登録が完了しました。", variant: "success" });
      } else {
        toast({ title: "エラーが発生しました", description: "登録に失敗しました。", variant: "error" });
      }
  
      setIsDialogOpen(false);
  
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [success, location.key]); // 👈 location.key を依存に追加
  

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={onAddForm}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          フォーム追加
        </button>
      </div>

      <Form ref={formRef} method="post">
        <div className="space-y-4">{children}</div>
      </Form>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          追加
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">{dialogContent}</div>
          <DialogFooter>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {state !== 'idle' ? <Loader2 className="animate-spin" /> :'追加'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
