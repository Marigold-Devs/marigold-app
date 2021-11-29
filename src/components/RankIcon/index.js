import { CrownFilled } from '@ant-design/icons';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const RankIcon = ({ rank }) => {
  const render = useCallback(() => {
    let icon = null;

    switch (rank) {
      case 1:
        icon = (
          <CrownFilled
            style={{ fontSize: '1.5rem', marginRight: '5px', color: '#FFD700' }}
          />
        );
        break;
      case 2:
        icon = (
          <CrownFilled
            style={{
              fontSize: '1.25rem',
              marginRight: '5px',
              color: '#C0C0C0',
            }}
          />
        );
        break;
      case 3:
        icon = (
          <CrownFilled
            style={{ fontSize: '1rem', marginRight: '5px', color: '#CD7F32' }}
          />
        );
        break;
      default:
        break;
    }

    return icon;
  }, [rank]);

  return render();
};

RankIcon.propTypes = {
  rank: PropTypes.number,
};

export default RankIcon;
