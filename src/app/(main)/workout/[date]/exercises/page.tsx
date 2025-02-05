import ExercisesContainer from "./_components/ExercisesContainer";

type ExercisesPageProps = {
  params: {
    date: string;
  };
};

const ExercisesPage = async ({ params }: ExercisesPageProps) => {
  const { date } = await Promise.resolve(params);
  console.log(date);

  return (
    <>
      <ExercisesContainer />
    </>
  );
};

export default ExercisesPage;
