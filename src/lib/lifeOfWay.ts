/**
 * Life of Way calculation requested by the current project brief:
 *   X1 = 2 - 1
 *   X2 = 3 - 2 - 1
 *   X3 = 4 - 3 - 2 - 1
 *   X4 = 4
 *
 * Here inputs are named input1..input4, so the mapping is explicit and easy to change later.
 */
export function calculateLifeOfWay(input1: number, input2: number, input3: number, input4: number) {
  return {
    x1: input2 - input1,
    x2: input3 - input2 - input1,
    x3: input4 - input3 - input2 - input1,
    x4: input4
  }
}
