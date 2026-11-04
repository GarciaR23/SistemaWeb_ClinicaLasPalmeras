import { Status } from '../../recursos-humanos/models/postulante';

export interface IndicadorSalud {
  titulo: string;
  valor: number;
  icono: string;
}

export interface TrabajoPendiente {
  id: number;
  nombre: string;
  puesto: string;
  estado: Status;
  /** Página donde se atiende el pendiente. */
  ruta: string;
}
