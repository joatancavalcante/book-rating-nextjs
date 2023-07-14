export function itemMostOften(list: string[] | number[]) {
  const countMap = Object.create(null)

  for (const element of list) {
    countMap[element] = (countMap[element] || 0) + 1
  }

  const array = Object.values(countMap) as number[]

  const item = array.sort((a: number, b: number) => b - a)[0]

  const countMapArray = Object.entries(countMap)

  const itemMostOftenOnTheList = countMapArray.filter(
    (i) => i[1] === item && i[0],
  )[0][0]

  return itemMostOftenOnTheList
}
