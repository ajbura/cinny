import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Avatar.scss';

import Text from '../text/Text';
import RawIcon from '../system-icons/RawIcon';

function Avatar({
  text, bgColor, iconSrc, imageSrc, size, onClick,
}) {
  const [image, updateImage] = useState(imageSrc);
  let textSize = 's1';
  if (size === 'large') textSize = 'h1';
  if (size === 'small') textSize = 'b1';
  if (size === 'extra-small') textSize = 'b3';

  useEffect(() => updateImage(imageSrc), [imageSrc]);

  const clickProps = onClick ? {
    onClick,
    onKeyPress: onClick,
    role: 'button',
    tabIndex: 0,
  } : {};
  const clickableClassName = onClick ? 'clickable' : '';

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={`avatar-container avatar-container__${size} noselect ${clickableClassName}`} {...clickProps}>
      {
        image !== null
          ? <img src={image} onError={() => updateImage(null)} alt="avatar" />
          : (
            <span
              style={{ backgroundColor: iconSrc === null ? bgColor : 'transparent' }}
              className={`avatar__border${iconSrc !== null ? ' avatar__bordered' : ''} inline-flex--center`}
            >
              {
                iconSrc !== null
                  ? <RawIcon size={size} src={iconSrc} />
                  : text !== null && <Text variant={textSize}>{text}</Text>
              }
            </span>
          )
      }
    </div>
  );
}

Avatar.defaultProps = {
  text: null,
  bgColor: 'transparent',
  iconSrc: null,
  imageSrc: null,
  size: 'normal',
  onClick: null,
};

Avatar.propTypes = {
  text: PropTypes.string,
  bgColor: PropTypes.string,
  iconSrc: PropTypes.string,
  imageSrc: PropTypes.string,
  size: PropTypes.oneOf(['large', 'normal', 'small', 'extra-small']),
  onClick: PropTypes.func,
};

export default Avatar;
