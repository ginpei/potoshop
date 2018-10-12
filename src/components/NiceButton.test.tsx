import * as enzyme from 'enzyme';
import { shallow } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import NiceButton from './NiceButton';

// possible to move to test.js?
enzyme.configure({ adapter: new Adapter() });

describe('<NiceButton/>', () => {
  // type Wrapper = ShallowWrapper<PointerHandler['props'], PointerHandler['state'], PointerHandler>;

  it('renders with children', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        >Nice!</NiceButton>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders icon', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        icon="like"
        >Nice!</NiceButton>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('.NiceButton-icon').prop('className'))
      .toBe('fa fa-like NiceButton-icon');
  });

  it('renders prefixed icon', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        icon="fa-like"
        >Nice!</NiceButton>,
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('.NiceButton-icon').prop('className'))
      .toBe('fa fa-like NiceButton-icon');
  });

  it('invokes onClick callback', () => {
    const onClick = jest.fn();
    const wrapper = shallow<NiceButton>(
      <NiceButton
        onClick={onClick}
        >Nice!</NiceButton>,
    );
    expect(wrapper).toMatchSnapshot();
    wrapper.simulate('click');
    expect(onClick).toBeCalled();
  });
});
