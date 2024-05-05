import { PositionStatus } from './positionstatus.enum';
import { PositionSubStatus } from './positionsubstatus.model';

export interface Position {
  id?: string;
  name: string;
  status: PositionStatus;
  subStatus?: PositionSubStatus;
}
