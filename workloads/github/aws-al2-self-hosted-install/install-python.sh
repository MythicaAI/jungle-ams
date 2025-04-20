#!/usr/bin/env bash

PYTHON_VERSION=3.11.11

# system setup
yum -y groupinstall "Development Tools"
yum -y install gcc devel libffi-devel
yum -y install wget

# install openssl
wget https://github.com/openssl/openssl/releases/download/OpenSSL_1_1_1w/openssl-1.1.1w.tar.gz
tar zxvf openssl-1.1.1w.tar.gz
pushd openssl-1.1.1w
./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl
make -j 8
make install
popd
echo /usr/local/openssl/lib > /etc/ld.so.conf.d/openssl.conf
ldconfig

# install python
wget https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tgz
tar zxvf Python-${PYTHON_VERSION}.tgz
cd Python-${PYTHON_VERSION}/
./configure --enable-optimizations --with-openssl=/usr/local/openssl

make
make altinstall

# verify the install
python3.11 -m ssl
