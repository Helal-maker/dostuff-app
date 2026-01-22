/**
 * Question & Answer Randomization
 * Shuffles answer options to prevent answer key memorization
 */

/**
 * Fisher-Yates shuffle algorithm
 * Randomizes array in-place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle multiple choice options while tracking original indices
 * This is important to maintain the correct answer mapping
 */
export function shuffleMultipleChoiceWithTracking(options: string[]): {
  shuffledOptions: string[];
  originalIndices: number[];
  indexMapping: Map<number, number>; // maps new index to original index
} {
  const indexed = options.map((option, index) => ({ option, originalIndex: index }));
  const shuffled = shuffleArray(indexed);
  
  const indexMapping = new Map<number, number>();
  shuffled.forEach((item, newIndex) => {
    indexMapping.set(newIndex, item.originalIndex);
  });
  
  return {
    shuffledOptions: shuffled.map(item => item.option),
    originalIndices: shuffled.map(item => item.originalIndex),
    indexMapping
  };
}

/**
 * Randomize answer options for a question
 */
export function randomizeQuestionAnswers(question: any): any {
  if (!question) return question;
  
  const randomized = { ...question };
  
  // Shuffle options for multiple choice questions
  if (question.question_type === 'multiple_choice' && question.question_data?.options) {
    const { shuffledOptions, indexMapping } = shuffleMultipleChoiceWithTracking(
      question.question_data.options
    );
    
    randomized.question_data = {
      ...question.question_data,
      options: shuffledOptions,
      _indexMapping: Object.fromEntries(indexMapping) // Store mapping for answer verification
    };
  }
  
  // Shuffle options for true/false (optional, but randomizes their position)
  if (question.question_type === 'true_false') {
    const options = ['True', 'False'];
    randomized.question_data = {
      ...question.question_data,
      options: shuffleArray(options)
    };
  }
  
  // Shuffle options for matching questions
  if (question.question_type === 'matching' && question.question_data?.pairs) {
    const pairs = question.question_data.pairs || [];
    
    // Create indexed right column items with their original positions
    const rightItemsIndexed = pairs.map((pair: any, idx: number) => ({ 
      ...pair,
      _originalIndex: idx 
    }));
    
    // Shuffle the right column items using Fisher-Yates
    const shuffledRightItems = shuffleArray(rightItemsIndexed);
    
    // Create mapping: display position -> original index
    // This allows us to convert student's answer back to original pair index
    const rightIndexMapping: { [key: number]: number } = {};
    shuffledRightItems.forEach((item, displayPosition) => {
      rightIndexMapping[displayPosition] = item._originalIndex;
    });
    
    randomized.question_data = {
      ...question.question_data,
      pairs: shuffledRightItems, // Store shuffled pairs directly
      _rightIndexMapping: rightIndexMapping // Backup mapping for verification
    };
  }
  
  return randomized;
}

/**
 * Randomize all questions in an exam
 * Can optionally shuffle question order as well
 */
export function randomizeExamQuestions(
  questions: any[],
  shuffleQuestionOrder: boolean = false
): any[] {
  // Randomize answers within each question
  let randomized = questions.map(q => randomizeQuestionAnswers(q));
  
  // Optionally shuffle the question order itself
  if (shuffleQuestionOrder) {
    randomized = shuffleArray(randomized);
  }
  
  return randomized;
}

/**
 * Map student's answer back to original index after randomization
 * This is crucial for grading - converting the shuffled answer to the correct answer
 */
export function mapAnswerToOriginalIndex(
  shuffledIndex: number,
  indexMapping: { [key: number]: number }
): number {
  return indexMapping[shuffledIndex] ?? shuffledIndex;
}

/**
 * Reverse mapping - given an original answer index, find what it would be in shuffled order
 */
export function mapOriginalIndexToShuffled(
  originalIndex: number,
  indexMapping: { [key: number]: number }
): number {
  // Create reverse mapping
  for (const [shuffled, original] of Object.entries(indexMapping)) {
    if (Number(original) === originalIndex) {
      return Number(shuffled);
    }
  }
  return originalIndex;
}

/**
 * Verify answer is correct accounting for randomization
 */
export function verifyRandomizedAnswer(
  studentAnswer: number,
  correctAnswerOriginalIndex: number,
  indexMapping: { [key: number]: number } | undefined
): boolean {
  if (!indexMapping) {
    // No randomization was applied
    return studentAnswer === correctAnswerOriginalIndex;
  }
  
  // Map student's answer back to original index for comparison
  const mappedAnswer = mapAnswerToOriginalIndex(studentAnswer, indexMapping);
  return mappedAnswer === correctAnswerOriginalIndex;
}
