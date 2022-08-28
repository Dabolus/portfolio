const setVisibility = (element: HTMLElement, visible: boolean) => {
  if (visible) {
    element.classList.remove('invisible');
  } else {
    element.classList.add('invisible');
  }
  element.setAttribute('aria-hidden', visible ? 'false' : 'true');
};

export const setupTimeMachine = () => {
  const timeMachineButton =
    document.querySelector<HTMLDivElement>('#time-machine');
  const timeMachineDialog = document.querySelector<HTMLDialogElement>(
    '#time-machine-dialog',
  );
  const timeMachineTravelsContainer =
    timeMachineDialog.querySelector<HTMLUListElement>('ul');
  const timeMachineTravels = Array.from(
    timeMachineTravelsContainer.querySelectorAll<HTMLLIElement>('li'),
  );
  const previousTravelButton =
    timeMachineDialog.querySelector<HTMLDivElement>('#previous-travel');
  const nextTravelButton =
    timeMachineDialog.querySelector<HTMLDivElement>('#next-travel');
  const goToTravelLink = timeMachineDialog.querySelector<HTMLAnchorElement>(
    '.action-button.primary',
  );

  const updateActiveTravel = (newIndex: number) => {
    timeMachineTravels.forEach((travel, index) =>
      travel.setAttribute('aria-hidden', index === newIndex ? 'false' : 'true'),
    );
    goToTravelLink.setAttribute(
      'href',
      timeMachineTravels[newIndex].dataset.href,
    );
    goToTravelLink.hidden = newIndex === timeMachineTravels.length - 1;
    setVisibility(previousTravelButton, newIndex > 0);
    setVisibility(nextTravelButton, newIndex < timeMachineTravels.length - 1);
  };

  const scrollToTravel = (newIndex: number) =>
    timeMachineTravels[newIndex].scrollIntoView({ behavior: 'smooth' });

  previousTravelButton.addEventListener('click', () => {
    const currentTravelIndex = timeMachineTravels.findIndex(
      (travel) => travel.getAttribute('aria-hidden') !== 'true',
    );
    scrollToTravel(Math.max(currentTravelIndex - 1, 0));
  });
  nextTravelButton.addEventListener('click', () => {
    const currentTravelIndex = timeMachineTravels.findIndex(
      (travel) => travel.getAttribute('aria-hidden') !== 'true',
    );
    scrollToTravel(
      Math.min(currentTravelIndex + 1, timeMachineTravels.length - 1),
    );
  });

  timeMachineButton.addEventListener('click', () => {
    timeMachineButton.setAttribute('aria-expanded', 'true');
    timeMachineDialog.showModal();
  });

  timeMachineTravelsContainer.addEventListener('scroll', () => {
    if (
      timeMachineTravelsContainer.scrollLeft %
        timeMachineTravelsContainer.offsetWidth ===
      0
    ) {
      updateActiveTravel(
        timeMachineTravelsContainer.scrollLeft /
          timeMachineTravelsContainer.offsetWidth,
      );
    }
  });

  scrollToTravel(timeMachineTravels.length - 1);
  timeMachineButton.hidden = false;
};
