/* eslint-disable */ 
import { TileColor } from './Cube.js';

export class Piece {
  constructor(
  public color1: TileColor,
  public color2: TileColor = TileColor.none,
  public color3: TileColor | null = TileColor.none,
  public ix1: number,
  public ix2: number = 0,
  public ix3: number = 0) {
  if (color2 === null)
        color2 = TileColor.none;
  if (color3 === null)
        color3 = TileColor.none;
  }
}
