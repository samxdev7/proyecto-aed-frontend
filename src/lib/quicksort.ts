export type Comparador<T> = (a: T, b: T) => number;

/**
 * Esquema de partición de Tony Hoare.
 * Emplea dos punteros móviles que avanzan convergentemente desde ambos extremos hacia el centro.
 * El pivote se selecciona en la posición media Math.floor((low + high) / 2)
 * para garantizar un comportamiento O(n log n) frente a entradas pre-ordenadas o invertidas.
 *
 * @param arr Arreglo a particionar en el sitio.
 * @param low Índice inicial del subrango.
 * @param high Índice final del subrango.
 * @param comparar Función comparadora que devuelve < 0 si a < b, 0 si a == b, y > 0 si a > b.
 * @returns El índice de partición j tal que los elementos [low..j] son menores o iguales al pivote
 *          y los elementos [j+1..high] son mayores o iguales al pivote.
 */
export function particionHoare<T>(
  arr: T[],
  low: number,
  high: number,
  comparar: Comparador<T>
): number {
  const pivot = arr[Math.floor((low + high) / 2)];
  let i = low - 1;
  let j = high + 1;

  while (true) {
    do {
      i++;
    } while (comparar(arr[i], pivot) < 0);

    do {
      j--;
    } while (comparar(arr[j], pivot) > 0);

    if (i >= j) {
      return j;
    }

    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

function quicksortHoareInterno<T>(
  arr: T[],
  low: number,
  high: number,
  comparar: Comparador<T>
): void {
  if (low < high) {
    const p = particionHoare(arr, low, high, comparar);
    quicksortHoareInterno(arr, low, p, comparar);
    quicksortHoareInterno(arr, p + 1, high, comparar);
  }
}

/**
 * Ordena una colección inmutablemente empleando Quicksort con partición de Hoare.
 * Devuelve un nuevo arreglo ordenado sin alterar el original.
 */
export function quicksortHoare<T>(
  elementos: readonly T[],
  comparar: Comparador<T>
): T[] {
  if (elementos.length <= 1) {
    return [...elementos];
  }
  const copia = [...elementos];
  quicksortHoareInterno(copia, 0, copia.length - 1, comparar);
  return copia;
}
