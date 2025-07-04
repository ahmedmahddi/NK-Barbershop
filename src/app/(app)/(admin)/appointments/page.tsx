"use client";

import { FC } from "react";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import Image from "next/image";

// ----- Types -----
type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

// ----- Helper -----
const statusClass = (s: BookingStatus) =>
  ({
    pending: "bg-gold-950 text-gold-400 border border-gold-500/30",
    confirmed: "bg-emerald-950 text-emerald-400 border border-emerald-500/30",
    cancelled: "bg-rose-950 text-rose-400 border border-rose-500/30",
    completed: "bg-blue-950 text-blue-400 border border-blue-500/30",
    no_show: "bg-gray-950 text-gray-400 border border-gray-500/30",
  })[s];

// ----- Component -----
const AppointmentsPage: FC = () => {
  // Fetch bookings using TRPC
  const trpc = useTRPC();
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useSuspenseQuery(trpc.booking.getAll.queryOptions());

  // Mutation for updating booking status

  const queryClient = useQueryClient();
  const updateStatus = useMutation({
    ...trpc.booking.updateStatus.mutationOptions({
      onError: error => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.booking.getAll.queryFilter());
        toast.success("Status updated successfully");
      },
    }),
  });
  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error: {error.message}</div>;
  }

  if (bookings.length === 0) {
    return <div className="text-white">No bookings found.</div>;
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center">
        <div className="w-8 h-1 bg-gold-400 mr-4" />
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent">
          Appointments
        </h2>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gold-400/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-[0_0_15px_rgba(251,191,36,0.15)] overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-400/20">
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Customer
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Contact
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Service
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Barber
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Date & Time
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Image
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Comments
                </th>
                <th className="h-12 px-4 text-left font-medium text-gold-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                // Format date and time
                const startDate = new Date(booking.start);
                const formattedDate = startDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const formattedTime = startDate.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={booking.id}
                    className="border-b border-zinc-700/50 hover:bg-zinc-800/50"
                  >
                    <td className="p-4 font-medium">{booking.customerName}</td>
                    <td className="p-4">
                      <div>{booking.customerEmail}</div>
                      <div className="text-zinc-400">{booking.phone}</div>
                    </td>
                    <td className="p-4">
                      {typeof booking.service === "object"
                        ? booking.service.name
                        : booking.service}
                    </td>
                    <td className="p-4">
                      {typeof booking.barber === "object"
                        ? booking.barber.name
                        : booking.barber}
                    </td>
                    <td className="p-4">{`${formattedDate} – ${formattedTime}`}</td>
                    <td className="p-4">
                      {booking.referencePhoto ? (
                        <Image
                          width={64}
                          height={64}
                          src={booking.referencePhoto}
                          alt="Reference"
                          className="h-16 w-16 object-cover rounded-md"
                          onError={e =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : (
                        <span className="text-zinc-400">No image</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-pre-wrap">
                      {booking.comments || "—"}
                    </td>
                    <td className="p-4">
                      <select
                        value={booking.status}
                        onChange={e =>
                          updateStatus.mutate({
                            id: booking.id.toString(),
                            status: e.target.value as BookingStatus,
                          })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(booking.status)} focus:outline-none`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
