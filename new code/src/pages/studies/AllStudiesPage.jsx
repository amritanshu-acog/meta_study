import React from "react";
import AllStudiesMain from "../../components/study/all-studies/AllStudiesMain";
import StudyFilter from "../../components/study/StudyFilter";
import PageWithFilterLayout from "../../layouts/PageWithFilterLayout";

const AllStudiesPage = () => {
  return (
    <>
      <PageWithFilterLayout filters={<StudyFilter />}>
        <AllStudiesMain />
      </PageWithFilterLayout>
    </>
  );
};

export default AllStudiesPage;
