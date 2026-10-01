"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { ApiError } from "@/lib/api-client";
import { EstadisticasPanel } from "@/types/estadistica";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Clock
} from "lucide-react";
import Skeleton, { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ChipDificultad } from "@/components/ui/Chip";

export default function AdminDashboard() {
  const [stats, setStats] = useState<EstadisticasPanel | null>(null);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats(),
      adminService.listarReservas({ estado: "pendiente" }, 0, 1),
    ])
      .then(([panel, resPendientes]) => {
        setStats(panel);
        setPendientes(resPendientes.totalElements);
      })
      .catch((e) => {
        setMensaje(
          e instanceof ApiError && e.message
            ? e.message
            : "Ocurrió un error al obtener el panel. Inténtalo de nuevo.",
        );
        setError(true);
      });
  }, [reintentos]);

  function reintentar() {
    setStats(null);
    setError(false);
    setReintentos((n) => n + 1);
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar las estadísticas"
        descripcion={mensaje}
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  if (!stats) {
    return (
      <div className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
        <div className="overflow-x-auto bg-admin-surface rounded-md border border-admin-border shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
              <tr>
                <th className="p-md font-medium">Viaje</th>
                <th className="p-md font-medium">Dificultad</th>
                <th className="p-md font-medium text-right">Inscritos</th>
              </tr>
            </thead>
            <FilaTablaSkeleton columnas={3} />
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard
          title="Cupos Ofrecidos"
          value={stats.cuposReservados.totalCuposOfrecidos}
          icon={<Users className="text-admin-accent" />}
          color="bg-admin-bg"
        />
        <StatCard
          title="Cupos Reservados"
          value={stats.cuposReservados.totalCuposReservados}
          icon={<CalendarCheck className="text-warning-text" />}
          color="bg-warning-bg"
        />
        <StatCard
          title="Cupos Disponibles"
          value={stats.cuposReservados.totalCuposDisponibles}
          icon={<TrendingUp className="text-estado-aprobada-text" />}
          color="bg-estado-aprobada-bg"
        />
        {/* Mini-visor de auditoría: solicitudes que esperan decisión */}
        <div className="bg-admin-surface p-md rounded-md shadow-sm border border-admin-border flex flex-col gap-sm">
          <div className="flex items-center gap-md">
            <div className="p-sm rounded-md bg-estado-pendiente-bg">
              <Clock className="text-estado-pendiente-text" />
            </div>
            <div>
              <p className="text-xs text-admin-muted uppercase font-bold">Reservas pendientes</p>
              <p className="text-2xl font-bold text-admin-text">{pendientes}</p>
            </div>
          </div>
          <Link
            href="/admin/reservas?estado=pendiente"
            className="text-xs font-medium text-admin-accent hover:text-admin-accent-hover transition-colors"
          >
            Revisar y aprobar →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-admin-surface p-md rounded-md shadow-sm border border-admin-border">
          <h3 className="text-lg font-bold mb-sm">Inscritos por Viaje</h3>
          {stats.inscritosPorViaje.length === 0 ? (
            <p className="text-sm text-admin-muted italic">Aún no hay viajes con inscritos.</p>
          ) : (
            <div className="space-y-sm">
              {stats.inscritosPorViaje.map((item) => (
                <div key={item.idViaje} className="space-y-xs">
                  <div className="flex justify-between text-sm mb-xs">
                    <span>{item.titulo}</span>
                    <span className="font-medium">
                      {item.totalInscritos}/{item.cuposMaximos} · {item.porcentajeOcupacion}%
                    </span>
                  </div>
                  <div className="w-full bg-admin-bg rounded-sm h-2">
                    <div
                      className="bg-admin-accent h-2 rounded-sm transition-all"
                      style={{ width: `${Math.min(item.porcentajeOcupacion, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-admin-surface p-md rounded-md shadow-sm border border-admin-border">
          <h3 className="text-lg font-bold mb-sm">Rutas más Populares</h3>
          {stats.rutasMasPopulares.length === 0 ? (
            <p className="text-sm text-admin-muted italic">Aún no hay reservas aprobadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-admin-muted border-b border-admin-border">
                  <tr>
                    <th className="pb-sm font-medium">Viaje</th>
                    <th className="pb-sm font-medium">Dificultad</th>
                    <th className="pb-sm font-medium text-right">Reservas aprobadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {stats.rutasMasPopulares.map((ruta) => (
                    <tr key={ruta.idViaje} className="hover:bg-admin-bg transition-colors">
                      <td className="py-sm font-medium text-sm">{ruta.titulo}</td>
                      <td className="py-sm">
                        <ChipDificultad dificultad={ruta.dificultad} />
                      </td>
                      <td className="py-sm text-right text-sm">{ruta.totalReservasAprobadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-admin-surface p-md rounded-md shadow-sm border border-admin-border flex items-center gap-md">
      <div className={`p-sm rounded-md ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-admin-muted uppercase font-bold">{title}</p>
        <p className="text-2xl font-bold text-admin-text">{value}</p>
      </div>
    </div>
  );
}
