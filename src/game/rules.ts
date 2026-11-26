export const INITIAL_LIVES = 3;
export const MAX_LIVES = 3;
export const TOTAL_FRAGMENTS = 2;
export const collectFirefly = (lives: number) => Math.min(MAX_LIVES, lives + 1);
export const takeDamage = (lives: number) => Math.max(0, lives - 1);
export type Question = { prompt: string; code: string; answers: string[]; correct: number; hint: string };
export const questions: Record<number, Question[]> = {
  1: [
    { prompt: "¿Qué es un algoritmo en programación?", code: "", answers: ["Una pieza física de la computadora", "Una secuencia ordenada de pasos para resolver un problema", "Un tipo de virus informático"], correct: 1, hint: "Piensa en una receta: sus pasos se siguen en orden para obtener un resultado." },
    { prompt: "¿Qué es un evento en programación?", code: "", answers: ["Un bucle", "Algo que ocurre y desencadena una acción", "Algo que pasa siempre"], correct: 1, hint: "Cuando haces clic, puede comenzar una acción. Ese clic es un evento." },
    { prompt: "¿Para qué sirve una variable en un programa?", code: "", answers: ["Para apagar el monitor", "Para guardar y almacenar un dato que puede cambiar", "Para conectar el teclado"], correct: 1, hint: "Las vidas de Ada cambian durante la aventura: una variable permite recordar ese dato." },
  ],
  2: [
    { prompt: "¿Qué estructura usamos cuando queremos que una acción se repita varias veces?", code: "", answers: ["Un comentario", "Un bucle o ciclo (for / while)", "Una imagen"], correct: 1, hint: "Un ciclo permite ejecutar de nuevo las mismas instrucciones." },
    { prompt: "¿Qué tipo de dato representa valores que solo pueden ser Verdadero (true) o Falso (false)?", code: "", answers: ["String (Texto)", "Integer (Entero)", "Boolean (Booleano)"], correct: 2, hint: "Este tipo de dato tiene solo dos posibilidades: verdadero o falso." },
  ],
};
export const isCorrect = (question: Question, answer: number) => question.correct === answer;
export function getQuestion(level: number, index = 0): Question {
  const question = questions[level]?.[index] ?? questions[1]?.[0];
  if (!question) throw new Error("Question bank is empty");
  return question;
}
export const questionCount = (level: number) => questions[level]?.length ?? 1;
export const enemyTypes = (level: number): string[] => level === 1 ? ["golem", "plant"] : ["golem", "plant", "pincers", "spirit"];
export const nextProgress = (level: number) => ({ fragments: level, nextLevel: level === 1 ? 2 : null, victory: level === TOTAL_FRAGMENTS });