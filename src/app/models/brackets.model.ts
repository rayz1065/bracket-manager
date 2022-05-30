import { BracketT } from './bracket.model';

export interface BracketsT {
  main: BracketT;
  recovery: [BracketT, BracketT];
}
