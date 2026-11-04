export interface IndicadorAdministrador {
  titulo: string;
  valor: number;
  icono: string;
}

export type EstadoServicio = 'Operativo' | 'Con fallas';

export interface ServicioSistema {
  nombre: string;
  estado: EstadoServicio;
}

export interface ResumenAdministrador {
  indicadores: IndicadorAdministrador[];
  servicios: ServicioSistema[];
}

export interface AccesoRapido {
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: string;
}
