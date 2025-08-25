import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// FAQ data - in a real application, this might come from a CMS or API
const faqItems = [
  {
    question: "What is the admission process at KBHS?",
    answer:
      "The admission process at KBHS involves submitting an application form, providing previous academic records, attending an entrance examination, and participating in an interview. Applications are typically accepted between January and March for the following academic year. Visit our Admissions page for detailed information and to download the application form.",
  },
  {
    question: "What curriculum does KBHS follow?",
    answer:
      "KBHS follows the Kenya Certificate of Secondary Education (KCSE) curriculum as prescribed by the Kenya Institute of Curriculum Development (KICD). We offer a comprehensive range of subjects including Mathematics, Sciences, Languages, Humanities, and Technical subjects. We also incorporate additional programs to enhance critical thinking, creativity, and leadership skills.",
  },
  {
    question: "What are the school fees and payment options?",
    answer:
      "School fees vary by grade level and whether a student is a boarder or day scholar. We offer flexible payment plans including termly, semester, or annual payment options. Fee details are provided upon admission acceptance. We accept bank transfers, mobile money payments, and direct deposits. Please contact our finance office for detailed fee structures and payment procedures.",
  },
  {
    question: "What extracurricular activities are available?",
    answer:
      "KBHS offers a wide range of extracurricular activities including sports (football, basketball, volleyball, athletics, swimming), clubs (debate, science, drama, music, environmental), and community service opportunities. We believe in holistic education and encourage all students to participate in activities outside the classroom to develop their talents and interests.",
  },
  {
    question: "What are the boarding facilities like?",
    answer:
      "Our boarding facilities include separate dormitories for boys and girls, each supervised by experienced boarding staff. Dormitories are equipped with comfortable beds, storage space, study areas, and modern washroom facilities. We provide nutritious meals three times a day with snacks in between. The boarding environment is designed to foster independence, discipline, and a sense of community among students.",
  },
  {
    question: "How does KBHS support students academically?",
    answer:
      "KBHS provides comprehensive academic support through qualified teachers, well-equipped laboratories and libraries, remedial classes, and regular assessments. We maintain small class sizes to ensure personalized attention. Our teachers are available for consultation outside class hours, and we organize regular parent-teacher meetings to discuss student progress. We also offer career guidance and university preparation programs for senior students.",
  },
  {
    question: "What is the school's policy on discipline?",
    answer:
      "KBHS maintains high standards of discipline based on respect, responsibility, and integrity. We have a clear code of conduct that all students are expected to follow. Disciplinary measures are progressive and focus on character development rather than punishment. We work closely with parents to address behavioral concerns and promote positive values.",
  },
];

export default function FaqSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about KBHS High School's
            admissions, curriculum, facilities, and more.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="bg-[#295E4F] text-white">
              <CardTitle className="text-xl">Common Questions</CardTitle>
              <CardDescription className="text-gray-100">
                Click on a question to see the answer
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-gray-800">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Still have questions? Contact our admissions office at{" "}
              <a
                href="mailto:admissions@kbhs.edu"
                className="text-[#295E4F] font-medium hover:underline"
              >
                admissions@kbhs.edu
              </a>{" "}
              or call{" "}
              <a
                href="tel:+254700000000"
                className="text-[#295E4F] font-medium hover:underline"
              >
                +254 700 000000
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
