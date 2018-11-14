import * as enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import NiceFileInput from './NiceFileInput';

// possible to move to test.js?
enzyme.configure({ adapter: new Adapter() });

describe('<NiceFileInput/>', () => {
  it('renders', () => {
    const wrapper = shallow<NiceFileInput>(
      <NiceFileInput/>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('applies accept attr', () => {
    const wrapper = shallow<NiceFileInput>(
      <NiceFileInput
        accept="image/*"
        />,
    );
    expect(wrapper.find('input').prop('accept')).toBe('image/*');
  });

  it('invokes onChange callback', () => {
    const onChange = jest.fn();
    const wrapper = shallow<NiceFileInput>(
      <NiceFileInput
        onChange={onChange}
        />,
    );
    wrapper.find('input').simulate('change');
    expect(onChange).toBeCalled();
  });
});
