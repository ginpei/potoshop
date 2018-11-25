import * as enzyme from 'enzyme';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import NiceButton from './NiceButton';

// possible to move to test.js?
enzyme.configure({ adapter: new Adapter() });

describe('<NiceButton/>', () => {
  // type Wrapper = ShallowWrapper<PointerHandler['props'], PointerHandler['state'], PointerHandler>;

  it('renders as primary button', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        primary={true}
        >Nice!</NiceButton>,
    );
    expect(wrapper.prop('className'))
      .toBe('NiceButton niceButtonBase -primary');
  });

  it('renders as disabled', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        disabled={true}
        >Nice!</NiceButton>,
    );
    expect(wrapper.prop('disabled'))
      .toBe(true);
  });

  it('renders icon', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        icon="like"
        >Nice!</NiceButton>,
    );
    expect(wrapper.find('i').prop('className'))
      .toBe('fa fa-like niceButtonBase-leftIcon');
  });

  it('renders prefixed icon', () => {
    const wrapper = shallow<NiceButton>(
      <NiceButton
        icon="fa-like"
        >Nice!</NiceButton>,
    );
    expect(wrapper.find('i').prop('className'))
      .toBe('fa fa-like niceButtonBase-leftIcon');
  });

  it('invokes onClick callback', () => {
    const onClick = jest.fn();
    const wrapper = shallow<NiceButton>(
      <NiceButton
        onClick={onClick}
        >Nice!</NiceButton>,
    );
    wrapper.simulate('click');
    expect(onClick).toBeCalled();
  });
});
