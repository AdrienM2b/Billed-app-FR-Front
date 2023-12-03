/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import userEvent from '@testing-library/user-event';
import mockStore from '../__mocks__/store.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import Router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then ...', () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      // to-do write assertion
    });
    describe('When I upload a file', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a',
          })
        );
      });
      test('Then if the extension is incorrect, should show error message', async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
        const input = screen.getByTestId('file');
        const file = new File(['document'], 'image.txt', {
          type: 'text/plain',
        });
        const errorMessage = screen.getByTestId('error-message');

        input.addEventListener('change', handleChangeFile1);
        userEvent.upload(input, file);

        expect(errorMessage.classList).toContain('visible');
        expect(handleChangeFile1).toBeCalled();
      });
      test('Then if extension correct it should not show error message and create a bill', async () => {
        jest.spyOn(mockStore.bills(), 'create');

        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
        const file = new File(['document'], 'image.png', {
          type: 'image/png',
        });
        const input = screen.getByTestId('file');
        const errorMessage = screen.getByTestId('error-message');

        input.addEventListener('change', handleChangeFile1);
        userEvent.upload(input, file);

        await new Promise(process.nextTick);

        // on veut que le message ne soit pas affiché
        expect(errorMessage.classList).not.toContain('visible');
        // ici que la fonction handlechange soit bien appelé
        expect(handleChangeFile1).toBeCalled();
        // ici on veut verifier que la methode create a bien été appelé pour créer une bill
        expect(mockStore.bills().create).toHaveBeenCalled();
      });
      test('Then if data are corrupted an error 404 should be catched', async () => {
        jest
          .spyOn(mockStore.bills(), 'create')
          .mockRejectedValueOnce(new Error('Erreur 404'));

        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const consoleSpy = jest.spyOn(console, 'error');

        const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
        const file = new File(['document'], 'image.png', {
          type: 'image/png',
        });
        const input = screen.getByTestId('file');

        input.addEventListener('change', handleChangeFile1);
        userEvent.upload(input, file);

        await new Promise(process.nextTick);

        const consoleMessage = consoleSpy.mock.calls[0][0].message;

        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleMessage).toContain('Erreur 404');

        jest.clearAllMocks();
      });
      test('Then if data are corrupted an error 500 should be catched', async () => {
        jest
          .spyOn(mockStore.bills(), 'create')
          .mockRejectedValueOnce(new Error('Erreur 500'));

        const html = NewBillUI();
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        const consoleSpy = jest.spyOn(console, 'error');

        const handleChangeFile1 = jest.fn(newBill.handleChangeFile);
        const file = new File(['document'], 'image.png', {
          type: 'image/png',
        });
        const input = screen.getByTestId('file');

        input.addEventListener('change', handleChangeFile1);
        userEvent.upload(input, file);

        await new Promise(process.nextTick);

        const consoleMessage = consoleSpy.mock.calls[0][0].message;

        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleMessage).toContain('Erreur 500');
      });
      test('Then I submit the form and bill should be updated', () => {
        jest.spyOn(mockStore.bills(), 'update').mockResolvedValueOnce(() => {
          return Promise.resolve();
        });
        const html = NewBillUI();
        document.body.innerHTML = html;
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a',
          })
        );

        const onNavigate = jest.fn();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: localStorageMock,
        });

        console.log(JSON.parse(localStorage.getItem('user')));

        userEvent.type(screen.getByTestId('expense-name'), 'Test Expense');
        userEvent.type(screen.getByTestId('amount'), '100');
        userEvent.type(screen.getByTestId('datepicker'), '2021-08-01');
        userEvent.type(screen.getByTestId('vat'), '20');
        userEvent.type(screen.getByTestId('pct'), '20');
        userEvent.type(screen.getByTestId('commentary'), 'Test Commentary');
        const submitButton = screen.getByRole('button');

        userEvent.click(submitButton);

        expect(mockStore.bills().update).toBeCalled();
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
      });
    });
  });
});
