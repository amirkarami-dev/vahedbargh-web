import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDocumentService } from "@/services";
import { ArchiveClient } from "./ArchiveClient";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const documentService = await getDocumentService();
  const documents = await documentService.getAll();

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <ArchiveClient documents={documents} />
      </main>
      <Footer />
    </>
  );
}
