export function createAnswerChoices(
  answer: number,
  random: () => number = Math.random,
): number[] {
  const choices = new Set<number>([answer])
  for (let offset = 1; choices.size < 4; offset += 1) {
    for (const candidate of [answer + offset, answer - offset]) {
      if (choices.size < 4 && (answer < 0 || candidate >= 0)) choices.add(candidate)
    }
  }

  const choicesList = [...choices]
  for (let index = choicesList.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1))
    ;[choicesList[index], choicesList[otherIndex]] = [
      choicesList[otherIndex],
      choicesList[index],
    ]
  }
  return choicesList
}
