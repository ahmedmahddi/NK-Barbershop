"use client";

import React, { FC, useState } from "react";
import { Scissors, Eye, Pencil, Trash2, UploadCloud } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { uploadReference } from "@/lib/uploadRefrence";
import { Media } from "@/payload-types";

// ──────────────── types ────────────────
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image?: Media | null;
  slug: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: string;
  image?: File | null;
}

// ───────────── composant ─────────────
const ServicesPage: FC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // États pour les modales et formulaires
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // États du formulaire
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    duration: "",
    image: null,
  });

  // Mutations
  const createMutation = useMutation({
    ...trpc.services.create.mutationOptions({
      onSuccess: () => {
        toast.success("Service créé avec succès !");
        queryClient.invalidateQueries({ queryKey: ["services", "getMany"] });
        setShowCreateModal(false);
        resetForm();
      },
      onError: error => {
        toast.error(`Erreur lors de la création du service : ${error.message}`);
      },
    }),
  });

  const updateMutation = useMutation({
    ...trpc.services.update.mutationOptions({
      onSuccess: () => {
        toast.success("Service mis à jour avec succès !");
        queryClient.invalidateQueries({ queryKey: ["services", "getMany"] });
        setShowEditModal(false);
        resetForm();
      },
      onError: error => {
        toast.error(
          `Erreur lors de la mise à jour du service : ${error.message}`
        );
      },
    }),
  });

  const deleteMutation = useMutation({
    ...trpc.services.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Service supprimé avec succès !");
        queryClient.invalidateQueries({ queryKey: ["services", "getMany"] });
        setShowDeleteModal(false);
        setSelectedService(null);
      },
      onError: error => {
        toast.error(
          `Erreur lors de la suppression du service : ${error.message}`
        );
      },
    }),
  });

  // Requête
  const {
    data: rawServices,
    isLoading,
    error,
  } = useSuspenseQuery(
    trpc.services.getMany.queryOptions({
      limit: 100,
    })
  );

  const services: Service[] = (rawServices ?? []).map((service: unknown) => {
    const s = service as Service;
    return { ...s };
  });

  // Fonctions utilitaires
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration: "",
      image: null,
    });
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const populateFormWithService = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      image: service.image ? undefined : null,
    });
    setPreviewUrl(service.image?.url ?? null);
    setSelectedFile(null);
  };

  // Gestionnaires d'événements
  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleView = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setSelectedService(service);
      toast.info(`Consultation du service ${service.name}`);
    }
  };

  const handleEdit = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setSelectedService(service);
      populateFormWithService(service);
      setShowEditModal(true);
    }
  };

  const handleDelete = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setSelectedService(service);
      setShowDeleteModal(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let mediaId: number | undefined;
    const file = selectedFile;

    if (file) {
      mediaId = await uploadReference(file);
    }
    await createMutation.mutateAsync({
      ...formData,
      image: mediaId !== undefined ? String(mediaId) : undefined,
    });
    setIsSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setIsSubmitting(true);

    let mediaId: number | undefined;
    let shouldRemoveImage = false;

    if (formData.image === null) {
      shouldRemoveImage = true;
    } else if (selectedFile) {
      mediaId = await uploadReference(selectedFile);
    }

    await updateMutation.mutateAsync({
      id: String(selectedService.id),
      ...formData,
      image: shouldRemoveImage
        ? undefined
        : mediaId !== undefined
          ? String(mediaId)
          : undefined,
    });

    setIsSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    await deleteMutation.mutateAsync(String(selectedService.id));
    setIsSubmitting(false);
  };

  // États de chargement et d'erreur
  if (isLoading) return <div className="text-center p-4">Chargement...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500">
        Erreur : {error.message}
      </div>
    );
  if (!services.length)
    return <div className="text-center p-4">Aucun service trouvé.</div>;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-1 bg-gold-400 mr-4" />
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
            Nos Services
          </h2>
        </div>
        <Button
          variant="outline"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl border border-gold-400/40 bg-zinc-800 px-4 py-2 text-gold-300 hover:bg-zinc-700 transition"
        >
          <Scissors size={20} />
          Créer un Service
        </Button>
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-400/20">
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Image
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Nom
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Description
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Prix
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Durée
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr
                  key={s.id}
                  className="border-b border-zinc-700/50 hover:bg-zinc-800/50"
                >
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={
                          typeof s.image === "string"
                            ? s.image
                            : s.image &&
                                typeof s.image === "object" &&
                                "url" in s.image &&
                                typeof s.image.url === "string"
                              ? s.image.url
                              : "/placeholder.png"
                        }
                        alt={s.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4 max-w-48 truncate">{s.description}</td>
                  <td className="p-4">TND {s.price.toFixed(2)}</td>
                  <td className="p-4">{s.duration}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(s.id)}
                        className="p-1 hover:text-gold-300 transition-colors"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(s.id)}
                        className="p-1 hover:text-gold-300 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-zinc-900 rounded-2xl border-gold-400/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gold-400">
              Créer un Nouveau Service
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gold-300 mb-2">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-gold-300 mb-2">
                  Prix (TND)
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration" className="text-gold-300 mb-2">
                  Durée (eg:30 minutes, 1 heure)
                </Label>
                <Input
                  id="duration"
                  type="text"
                  value={formData.duration}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-gold-300 mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-gold-300 mb-2">Image</Label>
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center h-[200px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors bg-zinc-900/30">
                {previewUrl ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <div className="relative w-full h-[120px] mb-4">
                      <Image
                        src={previewUrl}
                        width={32}
                        height={32}
                        alt="Prévisualisation de l'image"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border border-zinc-700 hover:border-rose-400/30 text-rose-400 rounded-2xl bg-zinc-800/70"
                      onClick={handleRemoveImage}
                    >
                      Supprimer l&apos;Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="text-5xl mb-4 text-zinc-600 group-hover:text-gold-400 transition-colors" />
                    <p className="text-lg text-zinc-400 mb-2">
                      Glissez et déposez votre image ici
                    </p>
                    <p className="text-sm text-zinc-600 mb-4">OU</p>
                    <Input
                      type="file"
                      id="image-create"
                      accept=".jpg,.png,.gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl"
                      onClick={() =>
                        document.getElementById("image-create")?.click()
                      }
                    >
                      Parcourir les Images
                    </Button>
                    <p className="text-xs text-zinc-600 mt-4">
                      Formats supportés : JPG, PNG, GIF (Max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-zinc-600 rounded-2xl text-zinc-300 hover:bg-zinc-800"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gold-600 rounded-2xl hover:bg-gold-700 text-white"
              >
                {isSubmitting ? "Création..." : "Créer un Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-zinc-900 rounded-2xl border-gold-400/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gold-400">
              Modifier le Service
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-gold-300 mb-2">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price" className="text-gold-300 mb-2">
                  Prix (TND)
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration" className="text-gold-300 mb-2">
                  Durée (eg:30 minutes, 1 heure)
                </Label>
                <Input
                  id="edit-duration"
                  type="text"
                  value={formData.duration}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-gold-300 mb-2">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-gold-300 mb-2">Image</Label>
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center h-[200px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors bg-zinc-900/30">
                {previewUrl ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <div className="relative w-full h-[120px] mb-4">
                      <Image
                        src={previewUrl}
                        width={32}
                        height={32}
                        alt="Prévisualisation de l'image"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border border-zinc-700 hover:border-rose-400/30 text-rose-400 rounded-2xl bg-zinc-800/70"
                      onClick={handleRemoveImage}
                    >
                      Supprimer l&apos;Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="text-5xl mb-4 text-zinc-600 group-hover:text-gold-400 transition-colors" />
                    <p className="text-lg text-zinc-400 mb-2">
                      Glissez et déposez votre image ici
                    </p>
                    <p className="text-sm text-zinc-600 mb-4">OU</p>
                    <Input
                      type="file"
                      id="image-edit"
                      accept=".jpg,.png,.gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl"
                      onClick={() =>
                        document.getElementById("image-edit")?.click()
                      }
                    >
                      Parcourir les Images
                    </Button>
                    <p className="text-xs text-zinc-600 mt-4">
                      Formats supportés : JPG, PNG, GIF (Max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-zinc-600 rounded-2xl text-zinc-300 hover:bg-zinc-800"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gold-600 rounded-2xl hover:bg-gold-700 text-white"
              >
                {isSubmitting ? "Mise à jour..." : "Mettre à jour le Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-zinc-900/90 rounded-2xl border-gold-400/nées text-white">
          <DialogHeader>
            <DialogTitle className="text-gold-400">
              Confirmer la Suppression
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-gold-300">
                {selectedService?.name}
              </span>
              ?
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Cette action ne peut pas être annulée.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-zinc-600 rounded-2xl text-zinc-300 hover:bg-zinc-800"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 rounded-2xl hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
