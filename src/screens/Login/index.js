import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Space, Typography } from 'antd';
import imgLogo from 'assets/images/logo.png';
import Box from 'components/elements/Box';
import { ErrorMessage, Form, Formik } from 'formik';
import { useAuth } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AuthService, TokensService } from 'services';
import * as Yup from 'yup';
import './styles.scss';

const formDetails = {
  defaultValues: {
    login: '',
    password: '',
  },
  schema: Yup.object().shape({
    login: Yup.string().required().label('Username'),
    password: Yup.string().required().label('Password'),
  }),
};

const Login = () => {
  const [isLoading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  return (
    <section className="Login">
      <Box className="Login_container">
        <img alt="logo" className="Login_logo" src={imgLogo} />

        <Formik
          initialValues={formDetails.defaultValues}
          validationSchema={formDetails.schema}
          onSubmit={(values, { setFieldError }) => {
            setLoading(true);

            AuthService.login({ body: values })
              .then(async (loginResponse) => {
                // call the Acquire Tokens endpoint to get the tokens
                const {
                  data: { access, refresh },
                } = await TokensService.acquire({
                  body: {
                    username: values.login,
                    password: values.password,
                  },
                });

                login({
                  user: loginResponse.data,
                  accessToken: access,
                  refreshToken: refresh,
                });
              })
              .catch(() => {
                setFieldError(
                  'password',
                  'Username, email, or password is invalid.'
                );
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          {({ setFieldValue }) => (
            <Form className="w-100">
              <Space className="w-100" direction="vertical" size="large">
                <div>
                  <Input
                    placeholder="Username"
                    prefix={<UserOutlined />}
                    size="large"
                    onChange={(e) => {
                      setFieldValue('login', e.target.value);
                    }}
                  />
                  <ErrorMessage
                    name="login"
                    render={(error) => (
                      <Typography.Text type="danger">{error}</Typography.Text>
                    )}
                  />
                </div>

                <div>
                  <Input
                    placeholder="Password"
                    prefix={<KeyOutlined />}
                    size="large"
                    type="password"
                    onChange={(e) => {
                      setFieldValue('password', e.target.value);
                    }}
                  />
                  <ErrorMessage
                    name="password"
                    render={(error) => (
                      <Typography.Text type="danger">{error}</Typography.Text>
                    )}
                  />
                </div>

                <Button
                  htmlType="submit"
                  loading={isLoading}
                  size="large"
                  type="primary"
                  block
                >
                  Login
                </Button>
              </Space>
            </Form>
          )}
        </Formik>
      </Box>
    </section>
  );
};

export default Login;
