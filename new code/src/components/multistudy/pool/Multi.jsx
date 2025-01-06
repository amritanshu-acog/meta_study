import React from "react";
import AllStudiesMain from "/src/components/multistudy/pool/AllStudiesMain";
import StudyFilter from "../../study/StudyFilter";
import PageWithFilterLayout from "../../../layouts/PageWithFilterLayout";

const AllStudiesPageMulti = () => {
  return (
    <>
      <PageWithFilterLayout filters={<StudyFilter />}>
        <AllStudiesMain />
      </PageWithFilterLayout>
    </>
  );
};

export default AllStudiesPageMulti;
