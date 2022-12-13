import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useModel, useModels } from '../../generic/model-store';

function CourseUnitsListElement({ content, courseId }) {
  return (
    <>
      <li
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {content.map((item) => (
          <Link className="text-primary-500" to={`/course/${courseId}/${item.sequences[0].id}`}>
            {item.label}
          </Link>
        ))}
      </li>
    </>
  );
}
CourseUnitsListElement.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      default: PropTypes.bool,
      id: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  courseId: PropTypes.string,
};

CourseUnitsListElement.defaultProps = {
  courseId: null,
};

export default function CourseUnitsList({
  courseId,
  sectionId,
  sequenceId,
  unitId,
  isStaff,
  /** [MM-P2P] Experiment */
  mmp2p,
}) {
  const course = useModel('coursewareMeta', courseId);
  const courseStatus = useSelector((state) => state.courseware.courseStatus);
  const sequenceStatus = useSelector((state) => state.courseware.sequenceStatus);

  const allSequencesInSections = Object.fromEntries(
    useModels('sections', course.sectionIds).map((section) => [
      section.id,
      {
        default: section.id === sectionId,
        title: section.title,
        sequences: useModels('sequences', section.sequenceIds),
      },
    ])
  );

  const links = useMemo(() => {
    const chapters = [];
    const sequentials = [];
    if (courseStatus === 'loaded' && sequenceStatus === 'loaded') {
      Object.entries(allSequencesInSections).forEach(([id, section]) => {
        chapters.push({
          id,
          label: section.title,
          default: section.default,
          sequences: section.sequences,
        });
        if (section.default) {
          section.sequences.forEach((sequence) => {
            sequentials.push({
              id: sequence.id,
              label: sequence.title,
              default: sequence.id === sequenceId,
              sequences: [sequence],
            });
          });
        }
      });
    }
    return [chapters, sequentials];
  }, [courseStatus, sequenceStatus, allSequencesInSections]);

  return (
    <div>
      <ol className="list-unstyled d-flex  flex-nowrap align-items-center m-0">
        {links.map((content) => (
          <CourseUnitsListElement courseId={courseId} content={content} />
        ))}
      </ol>
    </div>
  );
}

CourseUnitsList.propTypes = {
  courseId: PropTypes.string.isRequired,
  sectionId: PropTypes.string,
  sequenceId: PropTypes.string,
  unitId: PropTypes.string,
  isStaff: PropTypes.bool,
  /** [MM-P2P] Experiment */
  mmp2p: PropTypes.shape({
    state: PropTypes.shape({
      isEnabled: PropTypes.bool.isRequired,
    }),
  }),
};

CourseUnitsList.defaultProps = {
  sectionId: null,
  sequenceId: null,
  unitId: null,
  isStaff: null,
  /** [MM-P2P] Experiment */
  mmp2p: {},
};
