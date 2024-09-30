const commonRandom = (max = 1) => Math.round(Math.random() * max)

/**
 * Generates random numbers with an interval, it doesnt matter wich interval is higher
 * @param a First interval
 * @param b Second interval
 * @returns Random number between the interval, including the ones in the parameter
 */
export function random(a = 1, b = 0) {
  let max, min
  if (a >= b) [max, min] = [a, b]; else[min, max] = [a, b]
  return a == 1 && b == 0 ? commonRandom() : commonRandom(max - min) + min
}


/**
 * Selects elements from an Array, can select more than one but could be the same element
 * @param arr List of elements to be selected
 * @param items Amount of elements to be selected
 * @returns Elements selected randomly, will return an Array of elements if items > 1
 */
export function pickRandom<T>(arr: T[], items = 1): T[] {
  if (items < 1 ) throw new Error("You cant pick randomly less than 1 number: "+items); 
  if (items === 1) return [arr[commonRandom(arr.length)]];
  let ret: T[] = [];
  for (let i = 0; i < items; i++) ret[i] = pickRandom(arr) as T;
  return ret
}

/**
 * Extracts elements from an array and returns them inside another array
 * @param arr List of elements to extract random ones
 * @param items Amount of elements to be extracted
 * @param seeder Function that returns the random value
 * @param affected If true, will change the elements of the array, else it will return a different array
 * @returns Array of random extracted elements
 */
export function extractRandom<T>(arr: T[], items = 1, seeder = commonRandom, affected = true): T[] {
  if (items < 1 ) throw new Error("You cant pick randomly less than 1 number: "+items); 

  const copy = affected ? arr : [...arr];
  if (items === 1) return copy.splice(seeder(copy.length), 1);
  let ret: T[] = [];
  for (let i = 0; i < items; i++) {
    ret[i] = copy.splice(seeder(copy.length), 1)[0] as T;
  }
  return ret;
}

/**
 * Disorders the elements of the Array and returns a new Array if param affected is true, otherwise
 * will return the Array disordered
 * @param arr List of elements to be disordered
 * @param seeder RNG seeded to a string, must return float between 0 to 1
 * @param affected If true, will change the elements of the array, else it will return a different array
 * @returns Array of disordered elements 
 */
export function disorder<T>(arr: T[], seeder = Math.random, affected = false): T[] {
  const copy = affected ? arr : [...arr];
  return copy.sort(() => seeder() - .5)
}

/**
 * Returns randomly true or fale
 * @param seeder Function that generates random floats between 0 to 1
 * @returns Randomly pick true or fale
 */
export function randomBool(seeder = Math.random) {
  return Math.round(seeder()) ? true : false;
}