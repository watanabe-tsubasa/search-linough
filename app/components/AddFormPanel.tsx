import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Form, useNavigation, type LoaderFunctionArgs } from "react-router";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/Dialog";

type AddFormPanelProps = {
  title: string;
  onAddForm: () => void;
  dialogTitle: string;
  dialogContent: ReactNode;
  loaderData: { status: string | null; type: string | null };
  children: ReactNode;
};

export const commonAddFormLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  return { status, type };
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
  };
  const { status } = loaderData;

  useEffect(() => {
    if (status === "success") {
      setIsDialogOpen(false);
    }
  }, [status]);
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <button
            type="button"
            onClick={onAddForm}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            フォーム追加
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            追加
          </button>
        </div>
      </div>

      <Form ref={formRef} method="post">
        <div className="space-y-4">{children}</div>
      </Form>

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
