
import { Question } from './types';

export const MOCK_QUESTIONS: Question[] = [
  // Physics
  { id: 'p1', category: 'Physics', topic: 'Mechanics', question: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Pascal', 'Watt'], correctAnswer: 0 },
  { id: 'p2', category: 'Physics', topic: 'Energy', question: 'Kinetic energy is given by which formula?', options: ['mgh', '1/2 mv^2', 'F*d', 'P/t'], correctAnswer: 1 },
  { id: 'p3', category: 'Physics', topic: 'Optics', question: 'Which lens is used to correct myopia?', options: ['Convex', 'Concave', 'Cylindrical', 'Bifocal'], correctAnswer: 1 },
  { id: 'p4', category: 'Physics', topic: 'Electricity', question: 'Unit of resistance is?', options: ['Ampere', 'Volt', 'Ohm', 'Coulomb'], correctAnswer: 2 },
  
  // Chemistry
  { id: 'c1', category: 'Chemistry', topic: 'Organic', question: 'Which of these is a saturated hydrocarbon?', options: ['Ethene', 'Ethyne', 'Ethane', 'Benzene'], correctAnswer: 2 },
  { id: 'c2', category: 'Chemistry', topic: 'Periodic Table', question: 'Which element is a Noble Gas?', options: ['Oxygen', 'Helium', 'Chlorine', 'Sodium'], correctAnswer: 1 },
  { id: 'c3', category: 'Chemistry', topic: 'States of Matter', question: 'Process of solid changing directly to gas is?', options: ['Evaporation', 'Melting', 'Sublimation', 'Condensation'], correctAnswer: 2 },
  { id: 'c4', category: 'Chemistry', topic: 'Atomic Structure', question: 'Who discovered the electron?', options: ['Rutherford', 'Bohr', 'J.J. Thomson', 'Chadwick'], correctAnswer: 2 },

  // Biology
  { id: 'b1', category: 'Biology', topic: 'Cell Biology', question: 'Powerhouse of the cell is?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Body'], correctAnswer: 2 },
  { id: 'b2', category: 'Biology', topic: 'Genetics', question: 'Who is the Father of Genetics?', options: ['Darwin', 'Mendel', 'Lamarck', 'Watson'], correctAnswer: 1 },
  { id: 'b3', category: 'Biology', topic: 'Botany', question: 'Which pigment gives green color to plants?', options: ['Xanthophyll', 'Chlorophyll', 'Carotene', 'Anthocyanin'], correctAnswer: 1 },
  { id: 'b4', category: 'Biology', topic: 'Human Anatomy', question: 'Largest organ in the human body?', options: ['Liver', 'Brain', 'Skin', 'Lungs'], correctAnswer: 2 },

  // Mathematics
  { id: 'm1', category: 'Mathematics', topic: 'Algebra', question: 'What is the value of x if 2x + 5 = 15?', options: ['5', '10', '15', '20'], correctAnswer: 0 },
  { id: 'm2', category: 'Mathematics', topic: 'Geometry', question: 'Sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1 },
  { id: 'm3', category: 'Mathematics', topic: 'Trigonometry', question: 'sin²θ + cos²θ = ?', options: ['0', '1', '2', '-1'], correctAnswer: 1 },
  { id: 'm4', category: 'Mathematics', topic: 'Calculus', question: 'Derivative of x² with respect to x?', options: ['x', '2x', 'x/2', '2'], correctAnswer: 1 },
];
