export interface IndicadorDashboard {
  titulo: string;
  cantidad: number;
  descripcion: string;
  icono: string;
  color: 'azul' | 'amarillo' | 'morado' | 'verde';
}

export interface EtapaSeleccion {
  nombre: string;
  cantidad: number;
}

export interface EntrevistaDashboard {
  id: number;
  hora: string;
  nombre: string;
  puesto: string;
  iniciales: string;
}

export interface ActividadDashboard {
  id: number;
  descripcion: string;
  tiempo: string;
  icono: string;
}

export interface ResumenDashboard {
  indicadores: IndicadorDashboard[];
  etapas: EtapaSeleccion[];
  entrevistas: EntrevistaDashboard[];
  actividades: ActividadDashboard[];
}