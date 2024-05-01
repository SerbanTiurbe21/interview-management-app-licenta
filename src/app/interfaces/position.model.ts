import { PositionStatus } from './positionstatus.enum';

export interface Position {
  id?: string;
  name: string;
  status: PositionStatus;
}
