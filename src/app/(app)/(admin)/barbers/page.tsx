"use client";

import { FC, useState } from "react";
import {
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  UploadCloud,
} from "lucide-react";
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

// ──────────────── types ────────────────
interface Availability {
  day: string;
  date: string;
  slots: string[];
}

interface Specialization {
  skill: string;
}

interface Barber {
  id: number;
  name: string;
  photo?: { url: string } | null;
  description?: string;
  position: string;
  rank: string;
  experience: string;
  availability?: Availability;
  specializations: Specialization[];
}

interface BarberFormData {
  name: string;
  description: string;
  position: string;
  rank: string;
  experience: string;
  specializations: Specialization[];
  photo?: File | null; // Ajout du champ photo pour le téléchargement de fichier
}

// ───────────── composant ─────────────
const BarbersPage: FC = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // États pour les modales et formulaires
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // État pour la prévisualisation de l'image
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // État pour le fichier sélectionné

  // États du formulaire
  const [formData, setFormData] = useState<BarberFormData>({
    name: "",
    description: "",
    position: "Barbier",
    rank: "Junior",
    experience: "1-2 ans",
    specializations: [],
    photo: null,
  });

  // Mutations
  const createMutation = useMutation({
    ...trpc.team.create.mutationOptions({
      onSuccess: () => {
        toast.success("Barbier créé avec succès !");
        queryClient.invalidateQueries({ queryKey: ["team", "getMany"] });
        setShowCreateModal(false);
        resetForm();
      },
      onError: error => {
        toast.error(`Erreur lors de la création du barbier : ${error.message}`);
      },
    }),
  });

  const updateMutation = useMutation({
    ...trpc.team.update.mutationOptions({
      onSuccess: () => {
        toast.success("Barbier mis à jour avec succès !");
        queryClient.invalidateQueries({ queryKey: ["team", "getMany"] });
        setShowEditModal(false);
        resetForm();
      },
      onError: error => {
        toast.error(
          `Erreur lors de la mise à jour du barbier : ${error.message}`
        );
      },
    }),
  });

  const deleteMutation = useMutation({
    ...trpc.team.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Barbier supprimé avec succès !");
        queryClient.invalidateQueries({ queryKey: ["team", "getMany"] });
        setShowDeleteModal(false);
        setSelectedBarber(null);
      },
      onError: error => {
        toast.error(
          `Erreur lors de la suppression du barbier : ${error.message}`
        );
      },
    }),
  });

  // Requête
  const {
    data: rawBarbers,
    isLoading,
    error,
  } = useSuspenseQuery(trpc.team.getMany.queryOptions());

  const barbers: Barber[] = (rawBarbers ?? []).map((barber: unknown) => {
    const b = barber as Barber;
    return { ...b };
  });

  // Fonctions utilitaires
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      position: "Barbier",
      rank: "Junior",
      experience: "1-2 ans",
      specializations: [],
      photo: null,
    });
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const populateFormWithBarber = (barber: Barber) => {
    setFormData({
      name: barber.name,
      description: barber.description ?? "",
      position: barber.position,
      rank: barber.rank,
      experience: barber.experience,
      specializations: barber.specializations ?? [],
      photo: barber.photo ? undefined : null,
    });
    setPreviewUrl(barber.photo?.url ?? null); // Définir la photo existante pour la prévisualisation
    setSelectedFile(null);
  };

  // Gestionnaires d'événements
  const handleCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleView = (id: number) => {
    const barber = barbers.find(b => b.id === id);
    if (barber) {
      setSelectedBarber(barber);
      toast.info(`Consultation du profil de ${barber.name}`);
    }
  };

  const handleEdit = (id: number) => {
    const barber = barbers.find(b => b.id === id);
    if (barber) {
      setSelectedBarber(barber);
      populateFormWithBarber(barber);
      setShowEditModal(true);
    }
  };

  const handleDelete = (id: number) => {
    const barber = barbers.find(b => b.id === id);
    if (barber) {
      setSelectedBarber(barber);
      setShowDeleteModal(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photo: null }));
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
      photo: mediaId !== undefined ? String(mediaId) : undefined,
    });
    setIsSubmitting(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber) return;
    setIsSubmitting(true);

    let mediaId: number | undefined;
    let shouldRemovePhoto = false;

    // Gestion des modifications de photo
    if (formData.photo === null) {
      // Suppression explicite demandée
      shouldRemovePhoto = true;
    } else if (selectedFile) {
      // Nouveau fichier téléchargé
      mediaId = await uploadReference(selectedFile);
    }

    await updateMutation.mutateAsync({
      id: selectedBarber.id.toString(),
      ...formData,
      // Envoyer undefined pour supprimer la photo, l'ID média pour une nouvelle photo, undefined pour aucun changement
      photo: shouldRemovePhoto
        ? undefined
        : mediaId !== undefined
          ? String(mediaId)
          : undefined,
    });

    setIsSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBarber) return;
    setIsSubmitting(true);
    await deleteMutation.mutateAsync(selectedBarber.id.toString());
    setIsSubmitting(false);
  };

  const addSpecialization = () => {
    setFormData(prev => ({
      ...prev,
      specializations: [...prev.specializations, { skill: "" }],
    }));
  };

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const updateSpecialization = (index: number, skill: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.map((spec, i) =>
        i === index ? { skill } : spec
      ),
    }));
  };

  // États de chargement et d'erreur
  if (isLoading) return <div className="text-center p-4">Chargement...</div>;
  if (error)
    return (
      <div className="text-center p-4 text-red-500">
        Erreur : {error.message}
      </div>
    );
  if (!barbers.length)
    return <div className="text-center p-4">Aucun barbier trouvé.</div>;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-1 bg-gold-400 mr-4" />
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
            Nos Barbiers
          </h2>
        </div>
        <Button
          variant="outline"
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-2xl border border-gold-400/40 bg-zinc-800 px-4 py-2 text-gold-300 hover:bg-zinc-700 transition"
        >
          <UserPlus size={20} />
          Créer un Barbier
        </Button>
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-400/20">
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Photo
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Nom
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Poste
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Expérience
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Rang
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Description
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Spécialités
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Disponibilité
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {barbers.map(b => (
                <tr
                  key={b.id}
                  className="border-b border-zinc-700/50 hover:bg-zinc-800/50"
                >
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={b.photo?.url ?? "/images/placeholder.png"}
                        alt={b.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4">{b.position}</td>
                  <td className="p-4">{b.experience}</td>
                  <td className="p-4">{b.rank}</td>
                  <td className="p-4 max-w-48 truncate">{b.description}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {b.specializations.map((s, i) => (
                        <span
                          key={s.skill + i}
                          className="px-2 py-1 text-xs bg-gold-900/30 border border-gold-800/30 rounded-2xl text-gold-300"
                        >
                          {s.skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {b.availability ? (
                      <div className="text-green-400">Disponible</div>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Non disponible
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(b.id)}
                        className="p-1 hover:text-gold-300 transition-colors"
                        title="Voir"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(b.id)}
                        className="p-1 hover:text-gold-300 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
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
              Créer un Nouveau Barbier
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
                <Label htmlFor="position" className="text-gold-300 mb-2">
                  Poste
                </Label>
                <select
                  id="position"
                  value={formData.position}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, position: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="Barbier">Barbier</option>
                  <option value="Barbier Senior">Barbier Senior</option>
                  <option value="Maître Barbier">Maître Barbier</option>
                  <option value="Apprenti">Apprenti</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rank" className="text-gold-300 mb-2">
                  Rang
                </Label>
                <select
                  id="rank"
                  value={formData.rank}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, rank: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Expert">Expert</option>
                  <option value="Maître">Maître</option>
                </select>
              </div>
              <div>
                <Label htmlFor="experience" className="text-gold-300 mb-2">
                  Expérience
                </Label>
                <select
                  id="experience"
                  value={formData.experience}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="1-2 ans">1-2 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5-10 ans">5-10 ans</option>
                  <option value="10+ ans">10+ ans</option>
                </select>
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
              <Label className="text-gold-300 mb-2">Photo</Label>
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center h-[200px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors bg-zinc-900/30">
                {previewUrl ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <div className="relative w-full h-[120px] mb-4">
                      <Image
                        src={previewUrl}
                        width={32}
                        height={32}
                        alt="Prévisualisation de la photo"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border border-zinc-700 hover:border-rose-400/30 text-rose-400 rounded-2xl bg-zinc-800/70"
                      onClick={handleRemovePhoto}
                    >
                      Supprimer la Photo
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
                      id="photo-create"
                      accept=".jpg,.png,.gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl"
                      onClick={() =>
                        document.getElementById("photo-create")?.click()
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gold-300">Spécialisations</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialization}
                  className="border-gold-400/40 rounded-2xl text-gold-300 hover:bg-gold-400/10"
                >
                  <Plus size={16} />
                </Button>
              </div>
              {formData.specializations.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={spec.skill}
                    onChange={e => updateSpecialization(index, e.target.value)}
                    className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                    placeholder="Entrez une spécialisation"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpecialization(index)}
                    className="border-red-400/40 rounded-2xl text-red-300 hover:bg-red-400/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
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
                {isSubmitting ? "Création..." : "Créer un Barbier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-zinc-900 rounded-2xl border-gold-400/20  text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gold-400">
              Modifier le Barbier
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
                <Label htmlFor="edit-position" className="text-gold-300">
                  Poste
                </Label>
                <select
                  id="edit-position"
                  value={formData.position}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, position: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="Barbier">Barbier</option>
                  <option value="Barbier Senior">Barbier Senior</option>
                  <option value="Maître Barbier">Maître Barbier</option>
                  <option value="Apprenti">Apprenti</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-rank" className="text-gold-300 mb-2">
                  Rang
                </Label>
                <select
                  id="edit-rank"
                  value={formData.rank}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, rank: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Expert">Expert</option>
                  <option value="Maître">Maître</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-experience" className="text-gold-300 mb-2">
                  Expérience
                </Label>
                <select
                  id="edit-experience"
                  value={formData.experience}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-gold-400/20 rounded-2xl text-white"
                  required
                >
                  <option value="1-2 ans">1-2 ans</option>
                  <option value="3-5 ans">3-5 ans</option>
                  <option value="5-10 ans">5-10 ans</option>
                  <option value="10+ ans">10+ ans</option>
                </select>
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
              <Label className="text-gold-300 mb-2 ">Photo</Label>
              <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-4 text-center h-[200px] flex flex-col items-center justify-center group hover:border-gold-400/30 transition-colors bg-zinc-900/30">
                {previewUrl ? (
                  <div className="w-full h-full relative flex flex-col items-center">
                    <div className="relative w-full h-[120px] mb-4">
                      <Image
                        src={previewUrl}
                        width={32}
                        height={32}
                        alt="Prévisualisation de la photo"
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border rounded-2xl border-zinc-700 hover:border-rose-400/30 text-rose-400 bg-zinc-800/70"
                      onClick={handleRemovePhoto}
                    >
                      Supprimer la Photo
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
                      id="photo-edit"
                      accept=".jpg,.png,.gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      className="bg-gradient-to-br from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl"
                      onClick={() =>
                        document.getElementById("photo-edit")?.click()
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-gold-300">Spécialisations</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialization}
                  className="border-gold-400/40 rounded-2xl text-gold-300 hover:bg-gold-400/10"
                >
                  <Plus size={16} />
                </Button>
              </div>
              {formData.specializations.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={spec.skill}
                    onChange={e => updateSpecialization(index, e.target.value)}
                    className="bg-zinc-800 rounded-2xl border-gold-400/20 text-white"
                    placeholder="Entrez une spécialisation"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpecialization(index)}
                    className="border-red-400/40 rounded-2xl text-red-300 hover:bg-red-400/10"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
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
                {isSubmitting ? "Mise à jour..." : "Mettre à jour le Barbier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-zinc-900/90 rounded-2xl border-gold-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-gold-400">
              Confirmer la Suppression
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Êtes-vous sûr de vouloir supprimer{" "}
              <span className="font-semibold text-gold-300">
                {selectedBarber?.name}
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

export default BarbersPage;
